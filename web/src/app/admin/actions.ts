'use server'

import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { Prisma, QuoteStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sendQuoteStatusEmail, sendNewUserEmail } from '@/lib/email'
import { signQuoteToken, verifyQuoteToken } from '@/lib/quote-token'

const MAX_TEXT = 20000
const ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

type Role = (typeof ROLES)[number]

async function requireSession() {
  const session = await auth()
  if (!session?.user) throw new Error('Non autorisé')
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

  if (!existingQuote) throw new Error('Demande introuvable')

  const now = new Date()
  const dateData: Prisma.QuoteRequestUpdateInput = {}

  switch (newStatus) {
    case 'CONTACTE': dateData.contactedAt = now; break
    case 'DEVIS_ENVOYE': dateData.quoteSentAt = now; break
    case 'CONFIRME': dateData.confirmedAt = now; break
    case 'PERDU': dateData.lostAt = now; break
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

export async function confirmQuoteByClient(
  quoteId: string,
  token: string,
) {
  if (!verifyQuoteToken(quoteId, token)) {
    return { success: false, error: 'Lien invalide.' }
  }

  const quote = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    select: { status: true },
  })

  if (!quote) return { success: false, error: 'Demande introuvable.' }
  if (quote.status === 'CONFIRME') return { success: true }

  if (quote.status !== 'DEVIS_ENVOYE') {
    return { success: false, error: "Ce devis n'est pas disponible à la confirmation." }
  }

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { status: 'CONFIRME', confirmedAt: new Date() },
  })

  revalidatePath('/admin/demandes')
  revalidatePath(`/admin/demandes/${quoteId}`)
  revalidatePath('/admin/dashboard')

  return { success: true }
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

  if (!name) throw new Error('Nom requis.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-mail invalide.')
  if (!ROLES.includes(role)) throw new Error('Rôle invalide.')

  let tempPassword: string | undefined
  let password = data.password

  if (!password) {
    tempPassword = randomBytes(12).toString('base64url')
    password = tempPassword
  } else if (password.length < 10) {
    throw new Error('Mot de passe trop court (10 caractères minimum).')
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (existing) throw new Error('Un utilisateur avec cet e-mail existe déjà.')

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
    console.error('Erreur lors de l\'envoi de l\'email de création de compte:', error)
  }

  revalidatePath('/admin/utilisateurs')
  return { success: true, tempPassword }
}

export async function toggleAdminUserStatus(userId: string, active: boolean) {
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

  if (!user) throw new Error('Utilisateur introuvable.')

  const tempPassword = randomBytes(12).toString('base64url')

  await prisma.adminUser.update({
    where: { id: userId },
    data: {
      passwordHash: await bcrypt.hash(tempPassword, 10),
      active: true,
    },
  })

  try {
    await sendNewUserEmail(user.email, user.name, tempPassword, user.role)
  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email:', error)
    throw new Error("Le mot de passe a été réinitialisé, mais l'email n'a pas pu être envoyé.")
  }

  revalidatePath('/admin/utilisateurs')
  return { success: true, tempPassword }
}

// 👇 NOUVELLE FONCTION : Changer son propre mot de passe
export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Non autorisé')

  if (newPassword.length < 10) {
    throw new Error('Le nouveau mot de passe doit faire au moins 10 caractères.')
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
  })

  if (!user) throw new Error('Utilisateur introuvable.')

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
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

// ─── /admin/prix : véhicules (prix/jour) et durée des circuits par saison ───────────────
// Prix par véhicule et par jour, jamais par personne.
type PriceResult = { success: true } | { success: false; error: string }

function parseInt0(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const n = Number(raw.replace(',', '.'))
  return Number.isInteger(n) ? n : Number.NaN
}

export async function saveVehicles(formData: FormData): Promise<PriceResult> {
  await requireSession()

  const ids = formData.getAll('vehicleId').map(String)
  const names = formData.getAll('vehicleName').map((v) => String(v).trim())
  const models = formData.getAll('vehicleModel').map((v) => String(v).trim())
  const seats = formData.getAll('vehicleSeats')
  const rates = formData.getAll('vehicleRate')
  const removed = new Set(formData.getAll('vehicleRemove').map(String))

  const rows: { id: string; name: string; modelName: string; seats: number; dailyRate: number; sortOrder: number }[] = []

  for (let i = 0; i < names.length; i += 1) {
    const id = ids[i] ?? ''
    if (id && removed.has(id)) continue
    if (!names[i] && !id && !String(rates[i] ?? '').trim()) continue // ligne vide

    const seat = parseInt0(seats[i] ?? null)
    const rate = parseInt0(rates[i] ?? null)
    if (!names[i] || names[i].length > 100) {
      return { success: false, error: `Véhicule ${i + 1} : le nom est requis (100 caractères max).` }
    }
    if (seat === null || !Number.isInteger(seat) || seat < 1 || seat > 100) {
      return { success: false, error: `${names[i]} : le nombre de places doit être un entier entre 1 et 100.` }
    }
    if (rate === null || !Number.isInteger(rate) || rate < 0 || rate > 100000) {
      return { success: false, error: `${names[i]} : le prix par jour doit être un nombre entier d'euros (0 à 100000).` }
    }
    rows.push({ id, name: names[i], modelName: (models[i] ?? '').slice(0, 100), seats: seat, dailyRate: rate, sortOrder: rows.length })
  }

  if (rows.length === 0) {
    return { success: false, error: 'Il faut garder au moins un véhicule.' }
  }

  const keepIds = rows.map((row) => row.id).filter(Boolean)

  await prisma.$transaction([
    prisma.vehicle.deleteMany({ where: keepIds.length ? { id: { notIn: keepIds } } : {} }),
    ...rows.map((row) =>
      row.id
        ? prisma.vehicle.upsert({
            where: { id: row.id },
            update: { name: row.name, modelName: row.modelName, seats: row.seats, dailyRate: row.dailyRate, sortOrder: row.sortOrder },
            create: { id: row.id, name: row.name, modelName: row.modelName, seats: row.seats, dailyRate: row.dailyRate, sortOrder: row.sortOrder },
          })
        : prisma.vehicle.create({
            data: { name: row.name, modelName: row.modelName, seats: row.seats, dailyRate: row.dailyRate, sortOrder: row.sortOrder },
          }),
    ),
  ])

  revalidatePath('/admin/prix')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function saveCircuitDurations(formData: FormData): Promise<PriceResult> {
  await requireSession()

  const keys = formData.getAll('circuitKey').map(String)
  const fields = ['dryMin', 'dryMax', 'rainyMin', 'rainyMax'] as const
  const values = Object.fromEntries(fields.map((field) => [field, formData.getAll(field)])) as Record<(typeof fields)[number], FormDataEntryValue[]>

  const writes: ReturnType<typeof prisma.circuitDuration.upsert>[] = []

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i]
    if (!key || key.length > 191) continue

    const parsed = Object.fromEntries(fields.map((field) => [field, parseInt0(values[field][i] ?? null)])) as Record<(typeof fields)[number], number | null>

    for (const field of fields) {
      const v = parsed[field]
      if (v !== null && (!Number.isInteger(v) || v < 1 || v > 120)) {
        return { success: false, error: `Circuit « ${key} » : les jours doivent être des entiers entre 1 et 120.` }
      }
    }
    if ((parsed.dryMin === null) !== (parsed.dryMax === null) || (parsed.rainyMin === null) !== (parsed.rainyMax === null)) {
      return { success: false, error: `Circuit « ${key} » : renseignez le minimum et le maximum pour chaque saison.` }
    }
    if ((parsed.dryMin !== null && parsed.dryMax! < parsed.dryMin) || (parsed.rainyMin !== null && parsed.rainyMax! < parsed.rainyMin)) {
      return { success: false, error: `Circuit « ${key} » : le maximum ne peut pas être inférieur au minimum.` }
    }

    writes.push(
      prisma.circuitDuration.upsert({
        where: { circuitKey: key },
        update: parsed,
        create: { circuitKey: key, ...parsed },
      }),
    )
  }

  await prisma.$transaction(writes)

  revalidatePath('/admin/prix')
  revalidatePath('/', 'layout')
  return { success: true }
}
