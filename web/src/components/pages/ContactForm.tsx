
'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import type { ContactFormBlock } from '@/lib/types'
import { getPublicCircuitDurations } from '@/lib/circuit-duration-actions'
import { brandTextColor, titleCase, titleSizeClass, headingFont } from '@/lib/typography'
import { QuoteEstimatePanel, type QuoteEstimate } from './QuoteEstimatePanel'
import { QuoteReviewDialog } from './QuoteReviewDialog'

type Circuit = {
  slug: string
  title: string
}

type RoadCondition = 'GOOD' | 'MEDIUM' | 'DIFFICULT'
type TravelSeason = 'DRY' | 'RAINY'

type PublicCircuitDuration = {
  circuitSlug: string
  season: TravelSeason
  roadCondition: RoadCondition
  minDays: number
  maxDays: number
}

type CircuitRange = {
  slug: string
  title: string
  minDays: number
  maxDays: number
}

type SeasonSummary = {
  circuits: CircuitRange[]
  minDays: number
  maxDays: number
  complete: boolean
}

type Props = {
  block: ContactFormBlock
  circuits?: Circuit[]
}

const ROAD_CONDITIONS: RoadCondition[] = [
  'GOOD',
  'MEDIUM',
  'DIFFICULT',
]

function getSeasonSummary(
  season: TravelSeason,
  selectedSlugs: string[],
  circuits: Circuit[],
  durations: PublicCircuitDuration[],
): SeasonSummary {
  const circuitRanges: CircuitRange[] = []
  let complete = true

  for (const slug of selectedSlugs) {
    const circuit = circuits.find(item => item.slug === slug)

    const entries = durations.filter(
      item =>
        item.circuitSlug === slug &&
        item.season === season &&
        ROAD_CONDITIONS.includes(item.roadCondition),
    )

    const hasAllConditions =
      ROAD_CONDITIONS.every(condition =>
        entries.some(item => item.roadCondition === condition),
      ) && entries.length === ROAD_CONDITIONS.length

    if (!circuit || !hasAllConditions) {
      complete = false
      continue
    }

    const validEntries = entries.every(
      item =>
        Number.isInteger(item.minDays) &&
        Number.isInteger(item.maxDays) &&
        item.minDays > 0 &&
        item.maxDays >= item.minDays,
    )

    if (!validEntries) {
      complete = false
      continue
    }

    circuitRanges.push({
      slug,
      title: circuit.title,
      minDays: Math.min(...entries.map(item => item.minDays)),
      maxDays: Math.max(...entries.map(item => item.maxDays)),
    })
  }

  if (circuitRanges.length !== selectedSlugs.length) {
    complete = false
  }

  return {
    circuits: circuitRanges,
    minDays: complete
      ? circuitRanges.reduce((sum, item) => sum + item.minDays, 0)
      : 0,
    maxDays: complete
      ? circuitRanges.reduce((sum, item) => sum + item.maxDays, 0)
      : 0,
    complete,
  }
}

export function ContactForm({ block, circuits = [] }: Props) {
  const pathname = usePathname()
  const firstSegment = pathname.split('/').filter(Boolean)[0]
  const locale = ['fr', 'en', 'it'].includes(firstSegment) ? firstSegment : 'fr'

  const t = useTranslations('contactForm')

  const isModalChoice = block.formType === 'both'
  const [activeModalForm, setActiveModalForm] = useState<'contact' | 'quote' | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const isQuote = isModalChoice
    ? activeModalForm === 'quote'
    : block.formType === 'quote'

  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')

  const [selectedCircuit, setSelectedCircuit] = useState('')
  const [extraCircuits, setExtraCircuits] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [vehicleCode, setVehicleCode] = useState('')
  const [vehicleLabel, setVehicleLabel] = useState('')
  const [vehicleCount, setVehicleCount] = useState(1)
  const [estimate, setEstimate] = useState<QuoteEstimate | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const pendingForm = useRef<HTMLFormElement | null>(null)

  // Nombre de jours inclus (du 1er au 5 = 5 jours), comme le calcul du serveur.
  const tripDays = (() => {
    if (!startDate || !endDate) return null
    const a = Date.parse(`${startDate}T00:00:00Z`)
    const b = Date.parse(`${endDate}T00:00:00Z`)
    if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null
    return Math.round((b - a) / 86_400_000) + 1
  })()
  const [durationData, setDurationData] = useState<PublicCircuitDuration[]>([])
  const [durationLoading, setDurationLoading] = useState(false)
  const [durationLoadError, setDurationLoadError] = useState(false)

  const selectedCircuitSlugs = useMemo(
    () => [
      ...(selectedCircuit ? [selectedCircuit] : []),
      ...extraCircuits,
    ],
    [selectedCircuit, extraCircuits],
  )

  const selectedSeason: TravelSeason | null = (() => {
    if (!startDate) return null

    const month = Number(startDate.split('-')[1])

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return null
    }

    return month >= 5 && month <= 10 ? 'DRY' : 'RAINY'
  })()

  useEffect(() => {
    let cancelled = false

    if (selectedCircuitSlugs.length === 0) {
      setDurationData([])
      setDurationLoading(false)
      setDurationLoadError(false)
      return
    }

    setDurationLoading(true)
    setDurationLoadError(false)

    getPublicCircuitDurations(selectedCircuitSlugs)
      .then(data => {
        if (cancelled) return
        setDurationData(data)
      })
      .catch(() => {
        if (cancelled) return
        setDurationData([])
        setDurationLoadError(true)
      })
      .finally(() => {
        if (!cancelled) {
          setDurationLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedCircuitSlugs])

  const seasonsToDisplay: TravelSeason[] = selectedSeason
    ? [selectedSeason]
    : ['DRY', 'RAINY']

  const seasonSummaries = seasonsToDisplay.map(season => ({
    season,
    summary: getSeasonSummary(
      season,
      selectedCircuitSlugs,
      circuits,
      durationData,
    ),
  }))

  const completeSummaries = seasonSummaries.filter(({ summary }) => summary.complete && summary.minDays > 0)
  const circuitDayRange = completeSummaries.length
    ? {
        min: Math.min(...completeSummaries.map(({ summary }) => summary.minDays)),
        max: Math.max(...completeSummaries.map(({ summary }) => summary.maxDays)),
      }
    : null

  useEffect(() => {
    if (!activeModalForm) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Échap dans le récapitulatif ne ferme que le récapitulatif.
        if (document.getElementById('quote-review-title')) return
        setActiveModalForm(null)
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )

      if (!focusableElements?.length) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      triggerRef.current?.focus()
    }
  }, [activeModalForm])

  const toggleExtraCircuit = (slug: string) => {
    setExtraCircuits(prev =>
      prev.includes(slug)
        ? prev.filter(item => item !== slug)
        : [...prev, slug],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isQuote) {
      // Demande de devis : le client voit d'abord le montant et l'acompte, puis envoie ou annule.
      pendingForm.current = event.currentTarget
      setError('')
      setReviewOpen(true)
      return
    }
    await sendRequest(event.currentTarget)
  }

  async function sendRequest(formElement: HTMLFormElement) {
    setError('')
    setReference('')
    setSending(true)

    const form = new FormData(formElement)

    const circuitSlug = String(form.get('circuitSlug') || '')
    let circuitTitle = circuits.find(c => c.slug === circuitSlug)?.title || ''

    if (extraCircuits.length > 0) {
      const extraTitles = extraCircuits
        .map(slug => circuits.find(c => c.slug === slug)?.title)
        .filter(Boolean)

      if (circuitTitle) {
        circuitTitle += ` + Extensions : ${extraTitles.join(', ')}`
      } else {
        circuitTitle = `Extensions : ${extraTitles.join(', ')}`
      }
    }

    const payload = {
      locale,
      circuitSlug: circuitSlug || (extraCircuits.length > 0 ? 'extensions' : ''),
      circuitTitle,
      firstName: String(form.get('firstName') || '').trim(),
      lastName: String(form.get('lastName') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      country: String(form.get('country') || '').trim(),
      startDate: String(form.get('startDate') || ''),
      endDate: String(form.get('endDate') || ''),
      adults: Number(form.get('adults') || 2),
      children: Number(form.get('children') || 0),
      message: String(form.get('message') || '').trim(),
      website: String(form.get('website') || ''),
      ...(isQuote && vehicleCode ? { vehicleCode, vehicleLabel, vehicleCount } : {}),
    }

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        const fieldErrors = result.fields
          ? Object.values(result.fields).flat().filter(Boolean).join(' ')
          : ''

        throw new Error(fieldErrors || result.error || t('error'))
      }

      setReference(result.reference || '')
      formElement.reset()
      setSelectedCircuit('')
      setExtraCircuits([])
      setStartDate('')
      setEndDate('')
      setVehicleCode('')
      setVehicleLabel('')
      setVehicleCount(1)
      setReviewOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
      setReviewOpen(false)
    } finally {
      setSending(false)
    }
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-gray-100'

  const formCard = (
    <div className="mx-auto max-w-3xl px-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        {block.title && (
          <h2
            className={`mb-3 text-gray-900 ${titleSizeClass(block.titleSize)} ${headingFont(block.titleFont, block.title)} ${block.titleWeight || 'font-normal'}`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title, locale)}
          </h2>
        )}

        {block.description && (
          <p className="mb-6 text-gray-600">{block.description}</p>
        )}

        {reference ? (
          <div
            className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-5 text-green-900"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold">{t('success')}</p>
              <p className="mt-2">
                {t('reference')}: <strong>{reference}</strong>
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-busy={sending}
          >
            {isQuote && circuits.length > 0 && (
              <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                <label
                  htmlFor="circuitSlug"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('circuit')}
                  <select
                    id="circuitSlug"
                    className={inputClass}
                    name="circuitSlug"
                    value={selectedCircuit}
                    onChange={e => {
                      setSelectedCircuit(e.target.value)
                      setExtraCircuits(prev =>
                        prev.filter(slug => slug !== e.target.value),
                      )
                    }}
                    disabled={sending}
                  >
                    <option value="">{t('circuitDefault')}</option>
                    {circuits.map(c => (
                      <option key={c.slug} value={c.slug}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="pt-2">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    {t('circuitExtras')}
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {circuits.map(c => {
                      if (c.slug === selectedCircuit) return null

                      return (
                        <label
                          key={c.slug}
                          className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                          <input
                            type="checkbox"
                            value={c.slug}
                            checked={extraCircuits.includes(c.slug)}
                            onChange={() => toggleExtraCircuit(c.slug)}
                            disabled={sending}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          {c.title}
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {isQuote && selectedCircuitSlugs.length > 0 && (
              <div
                className="space-y-4 rounded-xl border border-primary-200 bg-primary-50 px-5 py-4"
                role="status"
                aria-live="polite"
              >
                <p className="font-semibold text-gray-900">
                  {t('durationEstimateTitle')}
                </p>

                {durationLoading ? (
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    {t('durationLoading')}
                  </p>
                ) : durationLoadError ? (
                  <p className="text-sm text-gray-700">
                    {t('durationLoadError')}
                  </p>
                ) : (
                  seasonSummaries.map(({ season, summary }) => (
                    <div
                      key={season}
                      className="space-y-2 border-t border-primary-200 pt-3 first:border-0 first:pt-0"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {t(
                          season === 'DRY'
                            ? 'durationSeasonDry'
                            : 'durationSeasonRainy',
                        )}
                      </p>

                      {summary.complete ? (
                        <>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {summary.circuits.map(circuit => (
                              <li key={circuit.slug}>
                                {t('durationCircuitRange', {
                                  title: circuit.title,
                                  min: circuit.minDays,
                                  max: circuit.maxDays,
                                })}
                              </li>
                            ))}
                          </ul>

                          <p className="text-base font-bold text-gray-900">
                            {t('durationTotalRange', {
                              min: summary.minDays,
                              max: summary.maxDays,
                            })}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-700">
                          {t('durationIncomplete')}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('firstName')} *
                <input
                  className={inputClass}
                  name="firstName"
                  autoComplete="given-name"
                  maxLength={100}
                  required
                  disabled={sending}
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                {t('lastName')} *
                <input
                  className={inputClass}
                  name="lastName"
                  autoComplete="family-name"
                  maxLength={100}
                  required
                  disabled={sending}
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                {t('email')} *
                <input
                  className={inputClass}
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={191}
                  required
                  disabled={sending}
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                {t('phone')} *
                <input
                  className={inputClass}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  required
                  disabled={sending}
                />
              </label>

              <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                {t('country')}
                <input
                  className={inputClass}
                  name="country"
                  autoComplete="country-name"
                  maxLength={100}
                  disabled={sending}
                />
              </label>
            </div>

            {isQuote && (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('startDate')}
                  <input
                    className={inputClass}
                    name="startDate"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    disabled={sending}
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  {t('endDate')}
                  <input
                    className={inputClass}
                    name="endDate"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    disabled={sending}
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  {t('adults')}
                  <input
                    className={inputClass}
                    name="adults"
                    type="number"
                    min={1}
                    max={20}
                    defaultValue={2}
                    required
                    disabled={sending}
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  {t('children')}
                  <input
                    className={inputClass}
                    name="children"
                    type="number"
                    min={0}
                    max={20}
                    defaultValue={0}
                    required
                    disabled={sending}
                  />
                </label>
              </div>
            )}

            {isQuote && (
              <QuoteEstimatePanel
                locale={locale}
                vehicleCode={vehicleCode}
                vehicleCount={vehicleCount}
                days={tripDays}
                dayRange={circuitDayRange}
                withVehicleFields
                onVehicleChange={(code, label) => { setVehicleCode(code); setVehicleLabel(label) }}
                onVehicleCountChange={setVehicleCount}
                onEstimateChange={setEstimate}
                disabled={sending}
              />
            )}

            {/* Champ piège anti-spam, invisible pour les visiteurs */}
            <div className="hidden" aria-hidden="true">
              <label>
                Website
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <label className="block text-sm font-medium text-gray-700">
              {t('message')}
              <textarea
                className={inputClass}
                name="message"
                rows={5}
                maxLength={5000}
                disabled={sending}
              />
            </label>

            {error && (
              <p
                className="flex items-start gap-2 text-sm text-red-700"
                role="alert"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                {error || t('required')}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              aria-live="polite"
              className="inline-flex min-w-48 items-center justify-center gap-2 rounded-full bg-primary-600 px-7 py-3 font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending && (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {sending
                ? t('sending')
                : isQuote
                  ? t('submitQuote')
                  : t('submit')}
            </button>
          </form>
        )}
        <QuoteReviewDialog
          open={reviewOpen}
          locale={locale}
          estimate={estimate}
          sending={sending}
          onCancel={() => setReviewOpen(false)}
          onConfirm={() => { if (pendingForm.current) void sendRequest(pendingForm.current) }}
        />
      </div>
    </div>
  )

  if (isModalChoice) {
    return (
      <section>
        <div className="mx-auto max-w-3xl px-4 text-center">
          {block.title && (
            <h2
              className={`mb-3 ${titleSizeClass(block.titleSize)} ${headingFont(block.titleFont, block.title)} ${block.titleWeight || 'font-normal'}`}
              style={{ color: brandTextColor(block.titleColor) }}
            >
              {titleCase(block.title, locale)}
            </h2>
          )}

          {block.description && (
            <p className="mb-6 text-gray-600">{block.description}</p>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={activeModalForm === 'contact'}
              className="rounded-full border border-primary-600 px-7 py-3 font-semibold text-primary-700 transition-colors hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              onClick={event => {
                triggerRef.current = event.currentTarget
                setActiveModalForm('contact')
              }}
            >
              {t('openContact')}
            </button>

            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={activeModalForm === 'quote'}
              className="rounded-full bg-primary-600 px-7 py-3 font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              onClick={event => {
                triggerRef.current = event.currentTarget
                setActiveModalForm('quote')
              }}
            >
              {t('openQuote')}
            </button>
          </div>
        </div>

        {activeModalForm && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            onMouseDown={event => {
              if (event.target === event.currentTarget) {
                setActiveModalForm(null)
              }
            }}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={t(isQuote ? 'quoteTitle' : 'contactTitle')}
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl"
            >
              <button
                ref={closeButtonRef}
                type="button"
                aria-label={t('close')}
                className="absolute right-7 top-7 z-10 rounded-full bg-white p-2 text-gray-700 shadow transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                onClick={() => setActiveModalForm(null)}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>

              {formCard}
            </div>
          </div>
        )}
      </section>
    )
  }

  return <section>{formCard}</section>
}
