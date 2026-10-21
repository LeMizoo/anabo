'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

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
      status: status as any,
      adminNotes: notes || null,
    },
  })

  revalidatePath(`/admin/demandes/${id}`)
  revalidatePath('/admin/demandes')
}