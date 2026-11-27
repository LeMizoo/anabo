
'use server'

import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@/generated/prisma/client'
import {
  QuoteStatus,
  RoadCondition,
  TravelSeason,
} from '@/generated/prisma/enums'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { requireStaff, requireSuperAdmin as requireSuperAdminAccess } from '@/lib/admin-access'
import { sendQuoteStatusEmail, sendNewUserEmail, sendDepositReceivedEmail } from '@/lib/email'
import { signQuoteToken } from '@/lib/quote-token'
import { notifyIfShortage } from '@/lib/capacity-alerts'
import { getPaymentSettings } from '@/lib/payment-settings'
import { redirect } from 'next/navigation'
import { archiveRuleWhere, isArchiveRule } from '@/lib/quote-archive'

const MAX_TEXT = 20000
const ROLES = ['ADMIN', 'SUPER_ADMIN', 'CHAUFFEUR'] as const

type Role = (typeof ROLES)[number]

// Compte relu en base à chaque action : rôle et activation toujours à jour.
// Un compte Chauffeur ne peut appeler aucune de ces actions.
async function requireSession() {
  return { user: await requireStaff() }
}

async function requireSuperAdmin() {
  return { user: await requireSuperAdminAccess() }
}

export async function updateQuoteStatus(
  quoteId: string,
  newStatus: QuoteStatus,
  adminNotes?: string,
) {
  await requireSession()

  if (!Object.values(QuoteStatus).includes(newStatus)) {
    throw new Error('Statut invalide')
  }

  const existingQuote = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    select: { status: true },
  })

  if (!existingQuote) {
    throw new Error('Demande introuvable')
  }

  const now = new Date()
  const dateData: Prisma.QuoteRequestUpdateInput = {}

  switch (newStatus) {
    case 'CONTACTE':
      dateData.contactedAt = now
      break
    case 'DEVIS_ENVOYE':
      dateData.quoteSentAt = now
      break
    case 'CONFIRME':
      dateData.confirmedAt = now
      break
    case 'PERDU':
      dateData.lostAt = now
      break
  }

  const updatedQuote = await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: {
      status: newStatus,
      ...(adminNotes !== undefined
        ? { adminNotes: adminNotes.slice(0, MAX_TEXT) || null }
        : {}),
      ...dateData,
    },
  })

  const statusHasChanged = existingQuote.status !== newStatus
  let emailSent = false
  let emailError: string | null = null

  if (
    statusHasChanged &&
    (newStatus === 'DEVIS_ENVOYE' || newStatus === 'CONFIRME')
  ) {
    try {
      const token =
        newStatus === 'DEVIS_ENVOYE'
          ? signQuoteToken(updatedQuote.id)
          : undefined

      await sendQuoteStatusEmail(
        updatedQuote.email,
        updatedQuote.firstName,
        newStatus,
        updatedQuote.reference,
        token,
        updatedQuote.locale,
        {
          settings: await getPaymentSettings(),
          total: updatedQuote.quoteTotalAmount,
          currency: updatedQuote.quoteCurrency,
        },
      )

      emailSent = true
    } catch (error) {
      console.error('Erreur e-mail :', error)

      emailError =
        "Le statut est mis à jour, mais l'e-mail n'a pas pu être envoyé."
    }
  }

  revalidatePath('/admin/demandes')
  revalidatePath(`/admin/demandes/${quoteId}`)
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/planning')

  // Voyage confirmé : prévenir si des voyages se chevauchent (renfort nécessaire).
  if (newStatus === 'CONFIRME') await notifyIfShortage(quoteId)

  return {
    success: true,
    emailSent,
    emailError,
    statusChanged: statusHasChanged,
  }
}

export async function saveQuoteDetails(
  quoteId: string,
  quoteDetails: string,
  adminNotes?: string,
) {
  await requireSession()

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: {
      quoteDetails: quoteDetails.slice(0, MAX_TEXT) || null,
      ...(adminNotes !== undefined
        ? { adminNotes: adminNotes.slice(0, MAX_TEXT) || null }
        : {}),
    },
  })

  revalidatePath(`/admin/demandes/${quoteId}`)
  revalidatePath('/admin/demandes')

  return { success: true }
}

/**
 * Enregistre la préparation du voyage.
 *
 * La saison est déterminée automatiquement depuis la date de départ :
 * - Mai à octobre : DRY
 * - Novembre à avril : RAINY
 *
 * La durée indicative dépend du circuit, de la saison et de l'état des routes.
 * La durée finale reste librement choisie par l’équipe.
 */
export async function saveTripPlanning(
  quoteId: string,
  roadCondition: RoadCondition,
  selectedDurationDays: number,
) {
  await requireSession()

  if (!quoteId.trim()) {
    throw new Error('Identifiant de demande invalide.')
  }

  if (!Object.values(RoadCondition).includes(roadCondition)) {
    throw new Error('État des routes invalide.')
  }

  if (
    !Number.isInteger(selectedDurationDays) ||
    selectedDurationDays < 1 ||
    selectedDurationDays > 365
  ) {
    throw new Error('La durée choisie doit être comprise entre 1 et 365 jours.')
  }

  const quote = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    select: {
      id: true,
      startDate: true,
      circuitSlug: true,
    },
  })

  if (!quote) {
    throw new Error('Demande introuvable.')
  }

  if (!quote.startDate) {
    throw new Error('La date de départ est nécessaire pour déterminer la saison.')
  }

  // Utilisation du mois UTC pour éviter les différences de fuseau
  // entre le serveur et le navigateur.
  const departureMonth = quote.startDate.getUTCMonth() + 1

  const tripSeason: TravelSeason =
    departureMonth >= 5 && departureMonth <= 10
      ? 'DRY'
      : 'RAINY'

  let indicativeMinDays: number | null = null
  let indicativeMaxDays: number | null = null

  // Les circuits sur mesure n'ont pas de durée indicative configurée.
  if (quote.circuitSlug && quote.circuitSlug !== 'sur-mesure') {
    const duration = await prisma.circuitDuration.findUnique({
      where: {
        circuitSlug_season_roadCondition: {
          circuitSlug: quote.circuitSlug,
          season: tripSeason,
          roadCondition,
        },
      },
      select: {
        minDays: true,
        maxDays: true,
      },
    })

    if (duration) {
      indicativeMinDays = duration.minDays
      indicativeMaxDays = duration.maxDays
    }
  }

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: {
      tripSeason,
      roadCondition,
      indicativeMinDays,
      indicativeMaxDays,
      selectedDurationDays,
    },
  })

  revalidatePath(`/admin/demandes/${quoteId}`)
  revalidatePath('/admin/demandes')

  return {
    success: true,
    tripSeason,
    roadCondition,
    indicativeMinDays,
    indicativeMaxDays,
    selectedDurationDays,
  }
}

export async function createAdminUser(data: {
  name: string
  email: string
  role: string
  password?: string
  driverId?: string | null
}) {
  await requireSuperAdmin()

  const name = String(data.name || '').trim().slice(0, 150)
  const email = String(data.email || '').trim().toLowerCase().slice(0, 191)
  const role = data.role as Role

  if (!name) {
    throw new Error('Nom requis.')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('E-mail invalide.')
  }

  if (!ROLES.includes(role)) {
    throw new Error('Rôle invalide.')
  }

  let tempPassword: string | undefined
  let password = data.password

  if (!password) {
    tempPassword = randomBytes(12).toString('base64url')
    password = tempPassword
  } else if (password.length < 10) {
    throw new Error('Mot de passe trop court (10 caractères minimum).')
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email },
  })

  if (existing) {
    throw new Error('Un utilisateur avec cet e-mail existe déjà.')
  }

  const driverId = role === 'CHAUFFEUR' ? await validDriverId(data.driverId) : null

  await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      active: true,
      driverId,
    },
  })

  try {
    await sendNewUserEmail(email, name, password, role)
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'email de création de compte:",
      error,
    )
  }

  revalidatePath('/admin/utilisateurs')

  return { success: true, tempPassword }
}

export async function toggleAdminUserStatus(
  userId: string,
  active: boolean,
) {
  await requireSuperAdmin()

  const session = await auth()

  if (session?.user?.id === userId && !active) {
    throw new Error('Vous ne pouvez pas désactiver votre propre compte.')
  }

  if (!active) {
    const target = await prisma.adminUser.findUnique({ where: { id: userId }, select: { role: true, active: true } })
    if (target?.role === 'SUPER_ADMIN' && target.active && (await activeSuperAdmins()) <= 1) {
      throw new Error('Il doit rester au moins un super-administrateur actif.')
    }
  }

  await prisma.adminUser.update({
    where: { id: userId },
    data: { active },
  })

  revalidatePath('/admin/utilisateurs')

  return { success: true }
}

export async function resendAdminUserInvitation(userId: string) {
  await requireSuperAdmin()

  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('Utilisateur introuvable.')
  }

  const tempPassword = randomBytes(12).toString('base64url')

  await prisma.adminUser.update({
    where: { id: userId },
    data: {
      passwordHash: await bcrypt.hash(tempPassword, 10),
      active: true,
    },
  })

  try {
    await sendNewUserEmail(
      user.email,
      user.name,
      tempPassword,
      user.role,
    )
  } catch (error) {
    console.error("Erreur lors du renvoi de l'email:", error)

    throw new Error(
      "Le mot de passe a été réinitialisé, mais l'email n'a pas pu être envoyé.",
    )
  }

  revalidatePath('/admin/utilisateurs')

  return { success: true, tempPassword }
}

/** Fiche chauffeur existante (ou null) : un compte Chauffeur ne peut être relié qu'à une vraie fiche. */
async function validDriverId(value: unknown) {
  const id = typeof value === 'string' ? value.trim() : ''
  if (!id) return null
  const driver = await prisma.driver.findUnique({ where: { id }, select: { id: true } })
  if (!driver) throw new Error('Fiche chauffeur introuvable.')
  return driver.id
}

/** Nombre de SUPER_ADMIN actifs (on ne retire jamais le dernier). */
async function activeSuperAdmins() {
  return prisma.adminUser.count({ where: { role: 'SUPER_ADMIN', active: true } })
}

function backToUsers(message: string, isError = false): never {
  redirect(`/admin/utilisateurs?${isError ? 'erreur' : 'ok'}=${encodeURIComponent(message)}`)
}

/** Modifie un compte : nom, e-mail, rôle, fiche chauffeur liée. */
export async function updateAdminUser(formData: FormData) {
  const me = (await requireSuperAdmin()).user
  const id = String(formData.get('id') || '')
  const name = String(formData.get('name') || '').trim().slice(0, 150)
  const email = String(formData.get('email') || '').trim().toLowerCase().slice(0, 191)
  const role = String(formData.get('role') || '') as Role

  const user = await prisma.adminUser.findUnique({ where: { id } })
  if (!user) backToUsers('Utilisateur introuvable.', true)
  if (!name) backToUsers('Nom requis.', true)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) backToUsers('E-mail invalide.', true)
  if (!ROLES.includes(role)) backToUsers('Rôle invalide.', true)
  if (id === me.id && role !== 'SUPER_ADMIN') backToUsers('Vous ne pouvez pas retirer vos propres droits de super-administrateur.', true)
  if (user.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN' && user.active && (await activeSuperAdmins()) <= 1) {
    backToUsers('Il doit rester au moins un super-administrateur actif.', true)
  }
  if (email !== user.email && (await prisma.adminUser.findUnique({ where: { email } }))) {
    backToUsers('Un utilisateur avec cet e-mail existe déjà.', true)
  }

  let driverId: string | null = null
  try {
    driverId = role === 'CHAUFFEUR' ? await validDriverId(formData.get('driverId')) : null
  } catch (error) {
    backToUsers(error instanceof Error ? error.message : 'Fiche chauffeur invalide.', true)
  }

  await prisma.adminUser.update({ where: { id }, data: { name, email, role, driverId } })
  revalidatePath('/admin/utilisateurs')
  backToUsers(`Compte de ${name} mis à jour.`)
}

/** Supprime définitivement un compte (jamais le sien, jamais le dernier super-administrateur). */
export async function deleteAdminUser(formData: FormData) {
  const me = (await requireSuperAdmin()).user
  const id = String(formData.get('id') || '')
  if (id === me.id) backToUsers('Vous ne pouvez pas supprimer votre propre compte.', true)

  const user = await prisma.adminUser.findUnique({ where: { id } })
  if (!user) backToUsers('Utilisateur introuvable.', true)
  if (user.role === 'SUPER_ADMIN' && user.active && (await activeSuperAdmins()) <= 1) {
    backToUsers('Impossible de supprimer le dernier super-administrateur actif.', true)
  }

  await prisma.$transaction([
    prisma.adminPushSubscription.deleteMany({ where: { adminUserId: id } }),
    prisma.adminUser.delete({ where: { id } }),
  ])
  revalidatePath('/admin/utilisateurs')
  backToUsers(`Compte de ${user.name} supprimé.`)
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('Non autorisé')
  }

  if (newPassword.length < 10) {
    throw new Error('Le nouveau mot de passe doit faire au moins 10 caractères.')
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    throw new Error('Utilisateur introuvable.')
  }

  const isValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  )

  if (!isValid) {
    throw new Error('Le mot de passe actuel est incorrect.')
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(newPassword, 10),
    },
  })

  return { success: true }
}

/**
 * Suppression définitive d'une demande (spam, doublon, test).
 * Réservée au SUPER_ADMIN ; la référence doit être retapée pour confirmer.
 */
export async function deleteQuote(quoteId: string, confirmation: string) {
  await requireSuperAdmin()

  const quote = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    select: { reference: true },
  })

  if (!quote) {
    throw new Error('Demande introuvable.')
  }

  if (confirmation.trim().toUpperCase() !== quote.reference.toUpperCase()) {
    throw new Error('La référence saisie ne correspond pas.')
  }

  await prisma.quoteRequest.delete({ where: { id: quoteId } })

  revalidatePath('/admin/demandes')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/planning')

  return { success: true }
}


const CURRENCIES = ['EUR', 'MGA', 'USD'] as const

/** Montant total du devis (sert au calcul de l'acompte affiché au client). */
export async function saveQuotePayment(formData: FormData) {
  await requireSession()
  const quoteId = String(formData.get('quoteId') || '')
  const raw = String(formData.get('quoteTotalAmount') || '').replace(/\s/g, '')
  const currency = String(formData.get('quoteCurrency') || 'EUR').toUpperCase()
  if (!quoteId) throw new Error('Demande introuvable.')

  const total = raw ? Number(raw) : null
  if (total !== null && (!Number.isSafeInteger(total) || total < 0 || total > 1_000_000_000)) {
    throw new Error('Montant du devis invalide.')
  }
  if (!CURRENCIES.includes(currency as (typeof CURRENCIES)[number])) throw new Error('Devise invalide.')

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { quoteTotalAmount: total, quoteCurrency: total === null ? null : currency },
  })
  revalidatePath(`/admin/demandes/${quoteId}`)
  redirect(`/admin/demandes/${quoteId}`)
}

/** Marque le solde comme reçu (ou annule ce marquage). Retour vers la page d'origine. */
export async function toggleBalancePaid(formData: FormData) {
  await requireSession()
  const quoteId = String(formData.get('quoteId') || '')
  const quote = await prisma.quoteRequest.findUnique({ where: { id: quoteId }, select: { balancePaidAt: true } })
  if (!quote) throw new Error('Demande introuvable.')
  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { balancePaidAt: quote.balancePaidAt ? null : new Date() },
  })
  revalidatePath(`/admin/demandes/${quoteId}`)
  revalidatePath('/admin/comptabilite')
  redirect(safeReturnTo(formData.get('returnTo'), `/admin/demandes/${quoteId}`))
}

/** Marque l'acompte comme reçu (ou annule ce marquage). */
export async function toggleDepositPaid(formData: FormData) {
  await requireSession()
  const quoteId = String(formData.get('quoteId') || '')
  const quote = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    select: { depositPaidAt: true, email: true, firstName: true, reference: true, locale: true },
  })
  if (!quote) throw new Error('Demande introuvable.')
  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { depositPaidAt: quote.depositPaidAt ? null : new Date() },
  })
  // Acompte reçu : le client est prévenu que sa réservation est définitive.
  if (!quote.depositPaidAt) {
    await sendDepositReceivedEmail(quote.email, quote.firstName, quote.reference, quote.locale).catch((error) =>
      console.error('[acompte] E-mail de confirmation impossible :', error),
    )
  }
  revalidatePath(`/admin/demandes/${quoteId}`)
  revalidatePath('/admin/demandes')
  revalidatePath('/admin/planning')
  redirect(`/admin/demandes/${quoteId}`)
}


// ---------------------------------------------------------------------------
// Archivage des demandes (aucune suppression : désarchivage possible à tout moment)
// ---------------------------------------------------------------------------

/** Retour vers la liste en conservant les filtres (chemin interne uniquement). */
function safeReturnTo(value: FormDataEntryValue | null, fallback = '/admin/demandes') {
  const v = typeof value === 'string' ? value : ''
  return v.startsWith('/admin/') && !v.startsWith('//') ? v : fallback
}

function revalidateQuoteLists(ids: string[] = []) {
  revalidatePath('/admin/demandes')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/planning')
  for (const id of ids) revalidatePath(`/admin/demandes/${id}`)
}

/**
 * Archive une ou plusieurs demandes (champ « ids », répétable) ou toutes celles
 * correspondant à une règle (champ « rule » : perdu, termine, sans-suite).
 */
export async function archiveQuotes(formData: FormData) {
  const session = await requireSession()
  const by = session.user?.email || session.user?.name || 'admin'
  const rule = formData.get('rule')
  const ids = formData
    .getAll('ids')
    .map(String)
    .filter((id) => /^[a-z0-9]{10,40}$/i.test(id))
    .slice(0, 500)

  let where: Prisma.QuoteRequestWhereInput | null = null
  if (isArchiveRule(rule)) where = archiveRuleWhere(rule)
  else if (ids.length) where = { id: { in: ids }, archivedAt: null }

  if (where) {
    await prisma.quoteRequest.updateMany({ where, data: { archivedAt: new Date(), archivedBy: by } })
  }
  revalidateQuoteLists(ids)
  redirect(safeReturnTo(formData.get('returnTo')))
}

/** Désarchive une ou plusieurs demandes. */
export async function unarchiveQuotes(formData: FormData) {
  await requireSession()
  const ids = formData
    .getAll('ids')
    .map(String)
    .filter((id) => /^[a-z0-9]{10,40}$/i.test(id))
    .slice(0, 500)
  if (ids.length) {
    await prisma.quoteRequest.updateMany({ where: { id: { in: ids } }, data: { archivedAt: null, archivedBy: null } })
  }
  revalidateQuoteLists(ids)
  redirect(safeReturnTo(formData.get('returnTo')))
}
