'use client'

import { useTranslations } from 'next-intl'
import { Clock } from 'lucide-react'
import { formatGmtTime, formatMgDate, formatMgTime } from '@/lib/datetime'

/** Heure d'enregistrement d'une demande : heure de Madagascar (GMT+3) et équivalent GMT. */
export function QuoteReceivedAt({ iso, locale }: { iso: string | null; locale: string }) {
  const t = useTranslations('quoteEstimate')
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return (
    <p className="mt-3 inline-flex items-start gap-2 text-xs text-green-900/80" data-testid="quote-received-at">
      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>
        {t('receivedAt', {
          date: formatMgDate(d, locale, { day: 'numeric', month: 'long', year: 'numeric' }),
          time: formatMgTime(d, locale),
          gmt: formatGmtTime(d, locale),
        })}
      </span>
    </p>
  )
}
