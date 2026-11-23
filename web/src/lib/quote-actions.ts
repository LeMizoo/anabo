
'use server'

import { verifyQuoteToken } from '@/lib/quote-token'
import { revalidatePath } from 'next/cache'
import { notifyIfShortage } from '@/lib/capacity-alerts'
import { sendClientAcceptedAdminEmail, sendQuoteStatusEmail } from '@/lib/email'
import { sendPushToAdmins } from '@/lib/push'
import { depositAmount, formatAmount, getPaymentSettings } from '@/lib/payment-settings'

/**
 * Après l'acceptation en ligne : e-mail de confirmation au client (avec les
 * instructions d'acompte) et alerte à l'équipe. N'échoue jamais.
 */
async function afterClientAcceptance(quoteId: string, acceptedAt: Date) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const quote = await prisma.quoteRequest.findUnique({
      where: { id: quoteId },
      select: { id: true, reference: true, firstName: true, lastName: true, email: true, phone: true, locale: true, quoteTotalAmount: true, quoteCurrency: true },
    })
    if (!quote) return
    const settings = await getPaymentSettings()
    const amount = depositAmount(quote.quoteTotalAmount, settings.depositPercent)
    const depositText = amount ? formatAmount(amount, quote.quoteCurrency) : null

    await Promise.allSettled([
      sendQuoteStatusEmail(quote.email, quote.firstName, 'CONFIRME', quote.reference, undefined, quote.locale, {
        settings,
        total: quote.quoteTotalAmount,
        currency: quote.quoteCurrency,
      }),
      sendClientAcceptedAdminEmail({ ...quote, acceptedAt, depositPercent: settings.depositPercent, depositText }),
      sendPushToAdmins({
        title: `Devis accepté — ${quote.reference}`,
        body: `${quote.firstName} ${quote.lastName} a confirmé en ligne. Acompte attendu (${settings.depositPercent} %${depositText ? ` : ${depositText}` : ''}).`,
        url: `/admin/demandes/${quote.id}`,
        tag: `accepted-${quote.id}`,
      }),
    ])
  } catch (error) {
    console.error('[confirmation] Notifications impossibles :', error)
  }
}

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

    const current = await prisma.quoteRequest.findUnique({
      where: { id: quoteId },
      select: { startDate: true, endDate: true },
    })

    // Traçabilité : date et heure exactes de l'acceptation par le client
    // (référence du délai d'annulation de 15 jours) et dates de voyage acceptées,
    // conservées même si les dates du voyage sont modifiées ensuite.
    const acceptedAt = new Date()
    const result = await prisma.quoteRequest.updateMany({
      where: {
        id: quoteId,
        status: 'DEVIS_ENVOYE',
      },
      data: {
        status: 'CONFIRME',
        confirmedAt: acceptedAt,
        clientAcceptedAt: acceptedAt,
        acceptedStartDate: current?.startDate ?? null,
        acceptedEndDate: current?.endDate ?? null,
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
    revalidatePath('/admin/planning')

    await notifyIfShortage(quoteId)
    await afterClientAcceptance(quoteId, acceptedAt)

    return { success: true }
  } catch (error) {
    console.error('Erreur de confirmation du devis :', error)

    return {
      success: false,
      error: 'Une erreur est survenue lors de la confirmation.',
    }
  }
}
