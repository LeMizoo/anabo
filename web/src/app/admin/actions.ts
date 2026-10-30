'use server'

import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { Prisma, QuoteStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sendQuoteStatusEmail } from '@/lib/email'
import { signQuoteToken, verifyQuoteToken } from '@/lib/quote-token'

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

  if (!quote) {
    return { success: false, error: 'Demande introuvable.' }
  }

  if (quote.status === 'CONFIRME') {
    return { success: true }
  }

  if (quote.status !== 'DEVIS_ENVOYE') {
    return {
      success: false,
      error: "Ce devis n'est pas disponible à la confirmation.",
    }
  }

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: {
      status: 'CONFIRME',
      confirmedAt: new Date(),
    },
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

  revalidatePath('/admin/utilisateurs')

  return { success: true, tempPassword }
}