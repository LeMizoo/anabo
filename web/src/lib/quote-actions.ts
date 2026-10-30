
'use server'

import { verifyQuoteToken } from '@/lib/quote-token'
import { revalidatePath } from 'next/cache'

export async function confirmQuoteByClient(
  quoteId: string,
  token: string,
) {
  if (!quoteId || !token || !verifyQuoteToken(quoteId, token)) {
    return { success: false, error: 'Lien invalide.' }
  }

  try {
    // Chargement de Prisma uniquement au moment de la confirmation.
    const { prisma } = await import('@/lib/prisma')

    const result = await prisma.quoteRequest.updateMany({
      where: {
        id: quoteId,
        status: 'DEVIS_ENVOYE',
      },
      data: {
        status: 'CONFIRME',
        confirmedAt: new Date(),
      },
    })

    if (result.count === 0) {
      const quote = await prisma.quoteRequest.findUnique({
        where: { id: quoteId },
        select: { status: true },
      })

      if (!quote) {
        return { success: false, error: 'Demande introuvable.' }
      }

      if (quote.status === 'CONFIRME') {
        revalidatePath('/admin/demandes')
        revalidatePath(`/admin/demandes/${quoteId}`)
        revalidatePath('/admin/dashboard')
        return { success: true }
      }

      return {
        success: false,
        error: "Ce devis n'est pas disponible à la confirmation.",
      }
    }

    revalidatePath('/admin/demandes')
    revalidatePath(`/admin/demandes/${quoteId}`)
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Erreur de confirmation du devis :', error)

    return {
      success: false,
      error: 'Une erreur est survenue lors de la confirmation.',
    }
  }
}
