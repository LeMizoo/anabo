'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import type { QuoteStatus } from '@prisma/client' // 👈 Import du type

export async function updateQuoteStatus(
  id: string,
  status: string,
  notes: string
) {
  const session = await auth()
  if (!session) throw new Error('Non autorisé')

  await prisma.quoteRequest.update({
    where: { id },
    data: {
      status: status as QuoteStatus, // 👈 Plus de any
      adminNotes: notes || null,
    },
  })

  revalidatePath(`/admin/demandes/${id}`)
  revalidatePath('/admin/demandes')
}