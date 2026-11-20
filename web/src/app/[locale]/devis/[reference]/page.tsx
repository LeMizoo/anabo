import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { FormSubmitButton } from '@/components/admin/FormSubmitButton'
import { titleCase, titleSizeClass } from '@/lib/typography'
import { locales, defaultLocale, type Locale } from '@/lib/i18n'
import { verifyQuoteToken } from '@/lib/quote-token'

const REFERENCE_PATTERN = /^AR-[A-Z0-9]+-[A-F0-9]+$/

function safeLocale(value: string): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale
}

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string; reference: string }>
  searchParams: Promise<{ token?: string; error?: string }>
}

async function confirm(formData: FormData) {
  'use server'
  const quoteId = String(formData.get('quoteId') || '')
  const token = String(formData.get('token') || '')
  const rawReference = String(formData.get('reference') || '')
  // Valeurs issues du formulaire : validées pour éviter toute redirection externe.
  const locale = safeLocale(String(formData.get('locale') || ''))
  const reference = REFERENCE_PATTERN.test(rawReference) ? rawReference : ''

  const { redirect } = await import('next/navigation')

  if (!reference) {
    redirect(`/${locale}`)
  }

  if (!quoteId || !token) {
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
  const t = await getTranslations({ locale, namespace: 'quotePage' })
  const errorMessage = error ? decodeURIComponent(error) : ''
  const errorTranslations: Record<string, string> = {
    'Lien invalide.': t('invalidLink'),
    'Demande introuvable.': t('requestNotFound'),
    "Ce devis n'est pas disponible à la confirmation.": t('notReady'),
    'Une erreur est survenue lors de la confirmation.': t('confirmationError'),
  }
  const localizedError = errorTranslations[errorMessage] || errorMessage

  const { prisma } = await import('@/lib/prisma')
  if (!REFERENCE_PATTERN.test(reference)) notFound()

  const quote = await prisma.quoteRequest.findUnique({
    where: { reference },
  })
  if (!quote) notFound()

  // Les données personnelles et le contenu du devis ne sont visibles
  // qu'avec le lien signé envoyé par e-mail.
  const hasValidToken = !!token && verifyQuoteToken(quote.id, token)
  const canConfirm = quote.status === 'DEVIS_ENVOYE' && hasValidToken

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm border border-gray-200">
        <h1 className={`font-bold text-gray-900 mb-2 ${titleSizeClass('md')}`}>
          {titleCase(t('title', { reference: quote.reference }), locale)}
        </h1>
        {hasValidToken && (
          <p className="text-sm text-gray-600 mb-6">
            {quote.firstName} {quote.lastName} — {quote.email}
          </p>
        )}

        {error && (
          <p className="mb-6 rounded-lg bg-yellow-50 text-yellow-800 p-4 text-sm">
            {errorMessage === 'invalid'
              ? t('invalidLink')
              : localizedError}
          </p>
        )}

        {hasValidToken && (
          <section className="mb-8 whitespace-pre-wrap text-sm text-gray-800">
            {quote.quoteDetails || t('notWritten')}
          </section>
        )}

        {quote.status === 'CONFIRME' && (
          <p className="rounded-lg bg-green-50 text-green-800 p-4 text-sm font-medium">
            {t('alreadyConfirmed')}
          </p>
        )}

        {quote.status !== 'CONFIRME' && canConfirm && (
          <form action={confirm} className="space-y-3">
            <input type="hidden" name="quoteId" value={quote.id} />
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="reference" value={quote.reference} />
            <input type="hidden" name="locale" value={locale} />
            <FormSubmitButton
              label={t('confirm')}
              pendingLabel={t('confirming')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        )}

        {quote.status !== 'CONFIRME' && !canConfirm && !error && (
          <p className="rounded-lg bg-yellow-50 text-yellow-800 p-4 text-sm">
            {quote.status === 'DEVIS_ENVOYE'
              ? t('invalidLink')
              : t('notReady')}
          </p>
        )}

        <p className="mt-8 text-xs text-gray-500">
          {t('questions')} contact@anabo.mg
        </p>
        <p className="mt-3 text-xs text-gray-500">
          <Link href={`/${locale}/annulation`} className="underline">{t('cancellationLink')}</Link>
        </p>
      </div>
    </div>
  )
}
