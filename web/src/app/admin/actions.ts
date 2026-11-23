
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
import { sendQuoteStatusEmail, sendNewUserEmail } from '@/lib/email'
import { signQuoteToken } from '@/lib/quote-token'
import { notifyIfShortage } from '@/lib/capacity-alerts'

const MAX_TEXT = 20000
const ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

type Role = (typeof ROLES)[number]

async function requireSession() {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Non autorisé')
  }

  return session
}

async function requireSuperAdmin() {
  const session = await requireSession()

  if ((session.user as { role?: string }).role !== 'SUPER_ADMIN') {
    throw new Error('Seul un SUPER_ADMIN peut effectuer cette action.')
  }

  return session
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

  await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      active: true,
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
