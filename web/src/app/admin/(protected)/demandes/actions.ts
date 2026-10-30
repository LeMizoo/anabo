'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { QuoteStatus } from '@prisma/client'

const MAX_TEXT = 20000

export async function updateQuoteStatus(
  id: string,
  status: QuoteStatus,
  notes: string,
) {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Non autorisé')
  }

  if (!Object.values(QuoteStatus).includes(status)) {
    throw new Error('Statut invalide')
  }

  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!quote) {
    throw new Error('Demande introuvable')
  }

  const now = new Date()

  const dateData = {
    ...(status === 'CONTACTE' ? { contactedAt: now } : {}),
    ...(status === 'DEVIS_ENVOYE' ? { quoteSentAt: now } : {}),
    ...(status === 'CONFIRME' ? { confirmedAt: now } : {}),
    ...(status === 'PERDU' ? { lostAt: now } : {}),
  }

  await prisma.quoteRequest.update({
    where: { id },
    data: {
      status,
      adminNotes: (notes || '').slice(0, MAX_TEXT) || null,
      ...dateData,
    },
  })

  revalidatePath('/admin/demandes')
  revalidatePath(`/admin/demandes/${id}`)
  revalidatePath('/admin/dashboard')

  return { success: true }
}