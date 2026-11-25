'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AlertCircle, CheckCircle2, FileText, Loader2, Mail, X } from 'lucide-react'
import type { ContactFormBlock } from '@/lib/types'
import { getPublicCircuitDurations } from '@/lib/circuit-duration-actions'
import { brandTextColor, titleCase, titleSizeClass, headingFont } from '@/lib/typography'
import { QuoteEstimatePanel, type QuoteEstimate } from './QuoteEstimatePanel'
import { QuoteReviewDialog } from './QuoteReviewDialog'
import { QuoteReceivedAt } from './QuoteReceivedAt'

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
  circuitSlug: string
  circuitTitle: string
  minDays: number
  maxDays: number
}

type Props = {
  block: ContactFormBlock
  circuits?: Circuit[]
  defaultCircuitSlug?: string
  defaultCircuitTitle?: string
  locale?: string
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 transition focus:border-[#06245F] focus:outline-none focus:ring-2 focus:ring-[#06245F]/15'

const labelClass = 'mb-1.5 block text-sm font-medium text-[#06245F]'

function detectSeasonFromDate(dateStr: string): TravelSeason | null {
  const match = dateStr.match(/^\d{4}-(\d{2})-\d{2}$/)
  if (!match) return null
  const month = Number(match[1])
  if (month < 1 || month > 12) return null
  return month >= 5 && month <= 10 ? 'DRY' : 'RAINY'
}

function getSeasonLabel(season: TravelSeason | null, locale: string): string {
  if (!season) return ''

  if (locale === 'en') {
    return season === 'DRY' ? 'Dry season (May–October)' : 'Rainy season (November–April)'
  }

  if (locale === 'it') {
    return season === 'DRY' ? 'Stagione secca (maggio–ottobre)' : 'Stagione delle piogge (novembre–aprile)'
  }

  return season === 'DRY' ? 'Saison sèche (mai–octobre)' : 'Saison des pluies (novembre–avril)'
}

function getRoadConditionLabel(condition: RoadCondition, locale: string): string {
  if (locale === 'en') {
    if (condition === 'GOOD') return 'Good'
    if (condition === 'MEDIUM') return 'Medium'
    return 'Difficult'
  }

  if (locale === 'it') {
    if (condition === 'GOOD') return 'Buono'
    if (condition === 'MEDIUM') return 'Medio'
    return 'Difficile'
  }

  if (condition === 'GOOD') return 'Bon'
  if (condition === 'MEDIUM') return 'Moyen'
  return 'Difficile'
}

export function ContactForm({
  block,
  circuits = [],
  defaultCircuitSlug = '',
  defaultCircuitTitle = '',
  locale: propLocale,
}: Props) {
  const t = useTranslations('contactForm')
  const pathname = usePathname()

  const locale = useMemo(() => {
    if (propLocale) return propLocale
    const seg = pathname?.split('/')[1]
    return seg === 'en' || seg === 'it' ? seg : 'fr'
  }, [propLocale, pathname])

  // « both » : deux boutons sur la page (Nous contacter / Demander un devis), chacun ouvre son formulaire.
  const isChoice = block.formType === 'both'
  const [activeForm, setActiveForm] = useState<'contact' | 'quote' | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const isQuote = isChoice ? activeForm === 'quote' : block.formType === 'quote'

  const matchedDefaultCircuit = useMemo(() => {
    if (!defaultCircuitSlug && !defaultCircuitTitle) return null

    if (defaultCircuitSlug) {
      const bySlug = circuits.find(
        (item) => item.slug.toLowerCase() === defaultCircuitSlug.toLowerCase(),
      )
      if (bySlug) return bySlug
    }

    if (defaultCircuitTitle) {
      const normalizedTitle = defaultCircuitTitle.trim().toLowerCase()
      const byTitle = circuits.find(
        (item) => item.title.trim().toLowerCase() === normalizedTitle,
      )
      if (byTitle) return byTitle
    }

    return null
  }, [circuits, defaultCircuitSlug, defaultCircuitTitle])

  const initialCircuitSlug = matchedDefaultCircuit?.slug || defaultCircuitSlug || ''

  const circuitOptions = useMemo(() => {
    if (!defaultCircuitTitle || matchedDefaultCircuit) return circuits

    const slug = initialCircuitSlug || defaultCircuitTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    if (circuits.some((item) => item.slug === slug)) return circuits

    return [{ slug, title: defaultCircuitTitle }, ...circuits]
  }, [circuits, defaultCircuitTitle, matchedDefaultCircuit, initialCircuitSlug])

  const modalOpen = isChoice && activeForm !== null
  const closeModal = () => setActiveForm(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')
  const [receivedAt, setReceivedAt] = useState<string | null>(null)
  const [selectedCircuit, setSelectedCircuit] = useState(initialCircuitSlug)
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

  useEffect(() => {
    if (!selectedCircuit && initialCircuitSlug) {
      setSelectedCircuit(initialCircuitSlug)
    }
  }, [initialCircuitSlug, selectedCircuit])

  useEffect(() => {
    if (!modalOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      // Échap dans le récapitulatif ne ferme que le récapitulatif.
      if (e.key === 'Escape' && !document.getElementById('quote-review-title')) setActiveForm(null)
    }
    window.addEventListener('keydown', onKey)
    const trigger = triggerRef.current
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
      trigger?.focus()
    }
  }, [modalOpen])

  const openForm = (kind: 'contact' | 'quote', button: HTMLButtonElement) => {
    triggerRef.current = button
    setReference('')
    setReceivedAt(null)
    setError('')
    setActiveForm(kind)
  }

  useEffect(() => {
    let active = true

    if (selectedCircuitSlugs.length === 0) {
      setDurationData([])
      setDurationLoading(false)
      setDurationLoadError(false)
      return () => {
        active = false
      }
    }

    setDurationLoading(true)
    setDurationLoadError(false)

    getPublicCircuitDurations(selectedCircuitSlugs)
      .then((rows) => {
        if (!active) return
        setDurationData(rows)
        setDurationLoading(false)
      })
      .catch(() => {
        if (!active) return
        setDurationData([])
        setDurationLoading(false)
        setDurationLoadError(true)
      })

    return () => {
      active = false
    }
  }, [selectedCircuitSlugs])

  const detectedSeason = useMemo(
    () => detectSeasonFromDate(startDate),
    [startDate],
  )

  const circuitRanges = useMemo<CircuitRange[]>(() => {
    if (!detectedSeason || selectedCircuitSlugs.length === 0) return []

    const ranges: CircuitRange[] = []

    for (const slug of selectedCircuitSlugs) {
      const matchingRows = durationData.filter(
        (row) => row.circuitSlug === slug && row.season === detectedSeason,
      )

      if (matchingRows.length === 0) continue

      const minDays = Math.min(...matchingRows.map((row) => row.minDays))
      const maxDays = Math.max(...matchingRows.map((row) => row.maxDays))
      const circuitTitle =
        circuitOptions.find((item) => item.slug === slug)?.title || slug

      ranges.push({
        circuitSlug: slug,
        circuitTitle,
        minDays,
        maxDays,
      })
    }

    return ranges
  }, [detectedSeason, selectedCircuitSlugs, durationData, circuitOptions])

  const combinedRange = useMemo(() => {
    if (circuitRanges.length === 0) return null

    return {
      minDays: circuitRanges.reduce((sum, item) => sum + item.minDays, 0),
      maxDays: circuitRanges.reduce((sum, item) => sum + item.maxDays, 0),
    }
  }, [circuitRanges])

  const availableRoadConditions = useMemo<RoadCondition[]>(() => {
    if (!detectedSeason || selectedCircuitSlugs.length === 0) return []

    const order: RoadCondition[] = ['GOOD', 'MEDIUM', 'DIFFICULT']
    return order.filter((cond) =>
      selectedCircuitSlugs.some((slug) =>
        durationData.some(
          (row) =>
            row.circuitSlug === slug &&
            row.season === detectedSeason &&
            row.roadCondition === cond,
        ),
      ),
    )
  }, [detectedSeason, selectedCircuitSlugs, durationData])

  const activeCircuitTitle = useMemo(() => {
    if (!selectedCircuit) return ''
    return circuitOptions.find((item) => item.slug === selectedCircuit)?.title || selectedCircuit
  }, [circuitOptions, selectedCircuit])

  const toggleExtraCircuit = (slug: string) => {
    setExtraCircuits(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug],
    )
  }

  const durationEstimateTitle =
    locale === 'en'
      ? 'Indicative duration estimate'
      : locale === 'it'
        ? 'Stima indicativa della durata'
        : 'Estimation indicative de durée'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isQuote && !reviewOpen) {
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
    let circuitTitle = circuitOptions.find(c => c.slug === circuitSlug)?.title || ''

    if (extraCircuits.length > 0) {
      const extraTitles = extraCircuits
        .map(slug => circuitOptions.find(c => c.slug === slug)?.title)
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
      setReceivedAt(typeof result.createdAt === 'string' ? result.createdAt : null)
      setSelectedCircuit(initialCircuitSlug)
      setExtraCircuits([])
      setStartDate('')
      setEndDate('')
      setVehicleCode('')
      setVehicleLabel('')
      setVehicleCount(1)
      setEstimate(null)
      setReviewOpen(false)
      pendingForm.current = null
      formElement.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
      setReviewOpen(false)
    } finally {
      setSending(false)
    }
  }

  // Dans la fenêtre (mode « both »), le titre indique le formulaire ouvert.
  const formHeading = isChoice ? t(isQuote ? 'quoteTitle' : 'contactTitle') : block.title
  const formContent = (
    <div className="rounded-3xl bg-[#F8F6F1] p-6 shadow-sm md:p-10">
      {formHeading && (
        <h2
          className={`mb-3 pr-10 text-center ${titleSizeClass(isChoice ? 'h3' : block.titleSize)} ${headingFont(block.titleFont, formHeading)} ${block.titleWeight || 'font-normal'}`}
          style={{ color: brandTextColor(block.titleColor) }}
        >
          {titleCase(formHeading, locale)}
        </h2>
      )}

      {block.description && !isChoice && (
        <p className="mx-auto mb-8 max-w-2xl text-center text-gray-600">
          {block.description}
        </p>
      )}

      {reference ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center text-green-900">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
          <h3 className="text-lg font-semibold">{t('successTitle')}</h3>
          <p className="mt-1 text-sm">{t('successBody')}</p>
          <p className="mt-3 inline-block rounded-lg bg-white px-4 py-2 font-mono text-sm font-semibold text-[#06245F] shadow-xs">
            {t('referenceLabel')} : {reference}
          </p>
          <div>
            <QuoteReceivedAt iso={receivedAt} locale={locale} />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Champ anti-spam invisible pour les humains */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={labelClass}>
                {t('firstName')} *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder={t('firstNamePlaceholder')}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="lastName" className={labelClass}>
                {t('lastName')} *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder={t('lastNamePlaceholder')}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className={labelClass}>
                {t('email')} *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder={t('emailPlaceholder')}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>
                {t('phone')} *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder={t('phonePlaceholder')}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="country" className={labelClass}>
                {t('country')}
              </label>
              <input
                id="country"
                name="country"
                type="text"
                placeholder={t('countryPlaceholder')}
                className={inputClass}
              />
            </div>

            {circuitOptions.length > 0 && (
              <div>
                <label htmlFor="circuitSlug" className={labelClass}>
                  {t('circuit')}
                </label>
                <select
                  id="circuitSlug"
                  name="circuitSlug"
                  value={selectedCircuit}
                  onChange={(e) => {
                    const next = e.target.value
                    setSelectedCircuit(next)
                    setExtraCircuits(prev => prev.filter(s => s !== next))
                  }}
                  className={inputClass}
                >
                  <option value="">{t('circuitPlaceholder')}</option>
                  {circuitOptions.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {circuitOptions.length > 1 && (
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
              <p className="mb-2.5 text-sm font-medium text-[#06245F]">
                {t('extraCircuits')}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {circuitOptions.map((c) => {
                  if (c.slug === selectedCircuit) return null
                  const checked = extraCircuits.includes(c.slug)
                  return (
                    <label
                      key={c.slug}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 transition hover:border-[#06245F]/40"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExtraCircuit(c.slug)}
                        className="h-4 w-4 rounded border-gray-300 text-[#06245F] focus:ring-[#06245F]"
                      />
                      <span className="truncate">{c.title}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {isQuote && selectedCircuitSlugs.length > 0 && (
            <div className="rounded-2xl border border-[#06245F]/15 bg-white/80 p-4 text-sm text-gray-700">
              <p className="font-semibold text-[#06245F]">{durationEstimateTitle}</p>

              {!startDate ? (
                <p className="mt-1 text-xs text-gray-500">
                  {locale === 'en'
                    ? 'Select a departure date to view the indicative duration for the corresponding season.'
                    : locale === 'it'
                      ? 'Seleziona una data di partenza per visualizzare la durata indicativa in base alla stagione.'
                      : 'Indiquez une date de départ pour afficher la durée indicative selon la saison.'}
                </p>
              ) : durationLoading ? (
                <p className="mt-1 text-xs text-gray-500">
                  {locale === 'en'
                    ? 'Loading indicative durations...'
                    : locale === 'it'
                      ? 'Caricamento delle durate indicative...'
                      : 'Chargement des durées indicatives...'}
                </p>
              ) : durationLoadError ? (
                <p className="mt-1 text-xs text-amber-700">
                  {locale === 'en'
                    ? 'Indicative durations are temporarily unavailable.'
                    : locale === 'it'
                      ? 'Le durate indicative non sono momentaneamente disponibili.'
                      : 'Les durées indicatives sont momentanément indisponibles.'}
                </p>
              ) : !detectedSeason ? null : combinedRange ? (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600">
                    {getSeasonLabel(detectedSeason, locale)}
                    {availableRoadConditions.length > 0 && (
                      <>
                        {' · '}
                        {locale === 'en'
                          ? 'Road conditions: '
                          : locale === 'it'
                            ? 'Condizioni stradali: '
                            : 'État des routes : '}
                        {availableRoadConditions
                          .map((cond) => getRoadConditionLabel(cond, locale))
                          .join(', ')}
                      </>
                    )}
                  </p>
                  <p className="text-sm font-semibold text-[#06245F]">
                    {combinedRange.minDays === combinedRange.maxDays
                      ? `${combinedRange.minDays} ${locale === 'en' ? 'days' : locale === 'it' ? 'giorni' : 'jours'}`
                      : `${combinedRange.minDays} – ${combinedRange.maxDays} ${locale === 'en' ? 'days' : locale === 'it' ? 'giorni' : 'jours'}`}
                  </p>
                  {circuitRanges.length > 1 && (
                    <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
                      {circuitRanges.map((item) => (
                        <li key={item.circuitSlug}>
                          {item.circuitTitle} : {item.minDays === item.maxDays ? `${item.minDays} j` : `${item.minDays}–${item.maxDays} j`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {locale === 'en'
                    ? 'No indicative duration is configured yet for this selection.'
                    : locale === 'it'
                      ? 'Nessuna durata indicativa è ancora configurata per questa selezione.'
                      : 'Aucune durée indicative n’est encore configurée pour cette sélection.'}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className={labelClass}>
                {t('startDate')}
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="endDate" className={labelClass}>
                {t('endDate')}
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {isQuote && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="adults" className={labelClass}>
                  {t('adults')}
                </label>
                <input
                  id="adults"
                  name="adults"
                  type="number"
                  min={1}
                  max={20}
                  defaultValue={2}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="children" className={labelClass}>
                  {t('children')}
                </label>
                <input
                  id="children"
                  name="children"
                  type="number"
                  min={0}
                  max={20}
                  defaultValue={0}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {isQuote && (
            <QuoteEstimatePanel
              locale={locale}
              days={tripDays}
              minDays={tripDays ? null : combinedRange?.minDays ?? null}
              maxDays={tripDays ? null : combinedRange?.maxDays ?? null}
              vehicleCode={vehicleCode}
              vehicleLabel={vehicleLabel}
              vehicleCount={vehicleCount}
              circuitSlug={selectedCircuit || null}
              circuitTitle={activeCircuitTitle || null}
              onVehicleChangeAction={(code, label) => {
                setVehicleCode(code)
                setVehicleLabel(label)
              }}
              onVehicleCountChangeAction={setVehicleCount}
              onEstimateChangeAction={setEstimate}
            />
          )}

          <div>
            <label htmlFor="message" className={labelClass}>
              {t('message')}
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder={isQuote ? t('quoteMessagePlaceholder') : t('messagePlaceholder')}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#06245F] px-8 py-3.5 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#0b347d] disabled:opacity-60 sm:w-auto"
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}
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
        onCancelAction={() => setReviewOpen(false)}
        onConfirmAction={() => { if (pendingForm.current) void sendRequest(pendingForm.current) }}
      />
    </div>
  )

  if (isChoice) {
    return (
      <section className="container-custom mx-auto max-w-3xl px-4">
        <div className="rounded-3xl bg-[#F8F6F1] p-6 text-center shadow-sm md:p-10">
          {block.title && (
            <h2
              className={`mb-3 ${titleSizeClass(block.titleSize)} ${headingFont(block.titleFont, block.title)} ${block.titleWeight || 'font-normal'}`}
              style={{ color: brandTextColor(block.titleColor) }}
            >
              {titleCase(block.title, locale)}
            </h2>
          )}
          {block.description && <p className="mx-auto mb-8 max-w-2xl text-gray-600">{block.description}</p>}
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={activeForm === 'contact'}
              onClick={(e) => openForm('contact', e.currentTarget)}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#06245F] bg-white px-7 py-3 font-semibold text-[#06245F] transition hover:-translate-y-0.5 hover:bg-[#06245F]/5"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
              {t('openContact')}
            </button>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={activeForm === 'quote'}
              onClick={(e) => openForm('quote', e.currentTarget)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#06245F] px-7 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#0b347d]"
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
              {t('openQuote')}
            </button>
          </div>
        </div>
        {modalOpen && renderModal()}
      </section>
    )
  }

  return (
    <section className="container-custom mx-auto max-w-3xl px-4">
      {formContent}
    </section>
  )

  function renderModal() {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) closeModal()
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t(isQuote ? 'quoteTitle' : 'contactTitle')}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl"
        >
          <button
            type="button"
            onClick={closeModal}
            aria-label={t('close')}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
          {formContent}
        </div>
      </div>
    )
  }
}