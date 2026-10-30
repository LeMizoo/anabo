import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string; reference: string }>
  searchParams: Promise<{ token?: string; error?: string }>
}

async function confirm(formData: FormData) {
  'use server'
  const quoteId = String(formData.get('quoteId') || '')
  const token = String(formData.get('token') || '')
  const reference = String(formData.get('reference') || '')
  const locale = String(formData.get('locale') || 'fr')

  const { redirect } = await import('next/navigation')

  if (!quoteId || !token || !reference) {
    redirect(`/${locale}/devis/${reference}?error=invalid`)
  }

  const { confirmQuoteByClient } = await import('@/lib/quote-actions')
  const result = await confirmQuoteByClient(quoteId, token)

  if (!result.success) {
    redirect(`/${locale}/devis/${reference}?error=${encodeURIComponent(result.error || 'unknown')}`)
  }
  redirect(`/${locale}/devis/${reference}?confirmed=1`)
}

export default async function DevisPage({ params, searchParams }: Props) {
  const { locale, reference } = await params
  const { token, error } = await searchParams

  const { prisma } = await import('@/lib/prisma')
  const quote = await prisma.quoteRequest.findUnique({
    where: { reference },
  })
  if (!quote) notFound()

  const canConfirm = quote.status === 'DEVIS_ENVOYE' && !!token

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Votre devis {quote.reference}
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          {quote.firstName} {quote.lastName} — {quote.email}
        </p>

        {error && (
          <p className="mb-6 rounded-lg bg-yellow-50 text-yellow-800 p-4 text-sm">
            {decodeURIComponent(error) === 'invalid'
              ? 'Lien invalide : le jeton de confirmation est absent ou incorrect.'
              : decodeURIComponent(error)}
          </p>
        )}

        <section className="mb-8 whitespace-pre-wrap text-sm text-gray-800">
          {quote.quoteDetails || 'Le devis n\'a pas encore été rédigé.'}
        </section>

        {quote.status === 'CONFIRME' && (
          <p className="rounded-lg bg-green-50 text-green-800 p-4 text-sm font-medium">
            Ce devis a déjà été confirmé. Merci !
          </p>
        )}

        {quote.status !== 'CONFIRME' && canConfirm && (
          <form action={confirm} className="space-y-3">
            <input type="hidden" name="quoteId" value={quote.id} />
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="reference" value={quote.reference} />
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-white font-medium hover:bg-green-700"
            >
              Confirmer ce devis
            </button>
          </form>
        )}

        {quote.status !== 'CONFIRME' && !canConfirm && !error && (
          <p className="rounded-lg bg-yellow-50 text-yellow-800 p-4 text-sm">
            {quote.status === 'DEVIS_ENVOYE'
              ? 'Lien invalide : le jeton de confirmation est absent ou incorrect.'
              : 'Ce devis n\'est pas encore disponible pour confirmation.'}
          </p>
        )}

        <p className="mt-8 text-xs text-gray-500">
          Une question ? Contactez-nous à contact@anabo.mg
        </p>
      </div>
    </main>
  )
}