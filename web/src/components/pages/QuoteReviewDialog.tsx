'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, ShieldCheck } from 'lucide-react'
import { formatRange, type QuoteEstimate } from './QuoteEstimatePanel'

type Props = {
  open: boolean
  locale: string
  estimate: QuoteEstimate | null
  sending: boolean
  onConfirmAction: () => void
  onCancelAction: () => void
}

/** Récapitulatif avant l'envoi d'une demande de devis : montant, acompte, puis Envoyer / Annuler. */
export function QuoteReviewDialog({
  open,
  locale,
  estimate,
  sending,
  onConfirmAction,
  onCancelAction,
}: Props) {
  const t = useTranslations('quoteEstimate')
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sending) onCancelAction()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, sending, onCancelAction])

  if (!open) return null

  const total = estimate ? formatRange(estimate.totalMin, estimate.totalMax, estimate.currency, locale) : null
  const deposit = estimate ? formatRange(estimate.depositMin, estimate.depositMax, estimate.currency, locale) : null
  const percent = estimate?.depositPercent ?? 30

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={() => !sending && onCancelAction()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-review-title"
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 text-slate-800 shadow-2xl sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="quote-review-title" className="flex items-center gap-2 font-sans text-xl font-semibold text-[#06245F]">
          <ShieldCheck className="h-6 w-6 text-[#E0A01C]" aria-hidden="true" />
          {t('reviewTitle')}
        </h2>

        <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
          {total ? (
            <>
              <p className="flex flex-wrap justify-between gap-2">
                <span className="text-slate-600">{estimate?.days ? t('total') : t('totalRange')}</span>
                <strong className="text-lg text-[#06245F]">{total}</strong>
              </p>
              {percent > 0 && deposit && (
                <p className="flex flex-wrap justify-between gap-2">
                  <span className="text-slate-600">{t('deposit', { percent })}</span>
                  <strong className="text-lg text-[#E0A01C]">{deposit}</strong>
                </p>
              )}
              <p className="text-xs text-slate-500">{t('indicative')}</p>
            </>
          ) : (
            <p className="text-slate-700">{t('reviewNoAmount')}</p>
          )}
        </div>

        {percent > 0 && (
          <p className="mt-4 text-sm leading-6 text-slate-700">
            {t('reviewSteps', { method: estimate?.paymentMethod || 'Mobile Money' })}
          </p>
        )}
        <p className="mt-2 text-sm font-medium text-green-800">{t('reviewNoCommitment')}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancelAction}
            disabled={sending}
            className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {t('cancel')}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirmAction}
            disabled={sending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#06245F] px-6 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#0b347d] disabled:opacity-60"
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {t('send')}
          </button>
        </div>
      </div>
    </div>
  )
}