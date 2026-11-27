'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CalendarClock, Plus } from 'lucide-react'
import { getPublicCircuitDurations } from '@/lib/circuit-duration-actions'
import { circuitDurationRange, type DurationRow, type Season } from '@/lib/duration-range'

type Props = {
  locale: string
  /** Jours couverts par les dates du client */
  days: number | null
  /** Durée du programme choisi (cumul des circuits) */
  programme: { min: number; max: number } | null
  startDate: string
  season: Season | null
  /** Circuits non encore choisis, proposés en complément */
  candidates: { slug: string; title: string }[]
  onAddCircuitAction: (slug: string) => void
  onSetEndDateAction: (isoDate: string) => void
}

/** Date de retour pour une durée donnée (jour de départ compté). */
function endDateFor(startDate: string, days: number) {
  const start = Date.parse(`${startDate}T00:00:00Z`)
  return new Date(start + (days - 1) * 86_400_000).toISOString().slice(0, 10)
}

/**
 * Dates plus longues que le programme : propose un circuit complémentaire qui tient dans les jours libres,
 * ou de ramener la date de retour à la durée du programme. Le client choisit ; rien n'est imposé.
 */
export function ExtraDaysSuggestion({ locale, days, programme, startDate, season, candidates, onAddCircuitAction, onSetEndDateAction }: Props) {
  const t = useTranslations('quoteEstimate')
  const [rows, setRows] = useState<DurationRow[]>([])
  const slugsKey = candidates.map((c) => c.slug).join('|')
  const tooLong = !!(days && programme && startDate && days > programme.max)

  useEffect(() => {
    let active = true
    if (!tooLong || candidates.length === 0) return () => { active = false }
    getPublicCircuitDurations(candidates.map((c) => c.slug).slice(0, 30))
      .then((r) => { if (active) setRows(r) })
      .catch(() => { if (active) setRows([]) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugsKey, tooLong])

  const free = tooLong && days && programme ? days - programme.min : 0
  const fitting = useMemo(() => {
    if (!free) return []
    return candidates
      .map((c) => ({ ...c, range: circuitDurationRange(rows, [c.slug], season) }))
      .filter((c) => c.range && c.range.minDays <= free)
      .sort((a, b) => (b.range!.minDays - a.range!.minDays) || a.title.localeCompare(b.title))
      .slice(0, 6)
  }, [candidates, rows, season, free])

  if (!tooLong || !programme || !days) return null
  const adjusted = endDateFor(startDate, programme.min)
  const intlLocale = locale === 'en' ? 'en-GB' : locale === 'it' ? 'it-IT' : 'fr-FR'
  const adjustedLabel = new Date(`${adjusted}T00:00:00Z`).toLocaleDateString(intlLocale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

  return (
    <div className="space-y-3 rounded-2xl border border-[#E0A01C]/40 bg-amber-50/60 p-4" data-testid="extra-days">
      <p className="flex items-start gap-2 text-sm font-semibold text-[#06245F]">
        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-[#E0A01C]" aria-hidden="true" />
        {t('extraTitle', { free })}
      </p>
      <p className="text-xs leading-5 text-slate-700">{t('extraIntro', { days, min: programme.min, max: programme.max, free })}</p>

      {fitting.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-700">{t('extraAddHelp')}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {fitting.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => onAddCircuitAction(c.slug)}
                data-slug={c.slug}
                className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-800 transition hover:border-[#06245F]/50"
              >
                <span>
                  <span className="block font-medium">{c.title}</span>
                  <span className="block text-xs text-gray-500">
                    {c.range!.minDays === c.range!.maxDays ? t('days', { days: c.range!.minDays }) : `${c.range!.minDays}–${c.range!.maxDays} j`}
                  </span>
                </span>
                <Plus className="h-4 w-4 shrink-0 text-[#06245F]" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-600">{t('extraNone', { free })}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-amber-200 pt-3">
        <button
          type="button"
          onClick={() => onSetEndDateAction(adjusted)}
          data-testid="extra-adjust"
          className="rounded-full bg-[#06245F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b3a8c]"
        >
          {t('extraAdjust', { date: adjustedLabel, days: programme.min })}
        </button>
        <span className="text-xs text-slate-600">{t('extraKeep')}</span>
      </div>
    </div>
  )
}
