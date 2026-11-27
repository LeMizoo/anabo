'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import { brandTextColor, titleCase, titleSizeClass, headingFont } from '@/lib/typography'
import type { Circuit, CustomQuoteBlock, CustomQuoteOption, SanityImage } from '@/lib/types'
import { getPublicCircuitDurations } from '@/lib/circuit-duration-actions'
import { circuitDurationRange, seasonOf, type DurationRow } from '@/lib/duration-range'
import type { Locale } from '@/lib/i18n'
import { QuoteEstimatePanel, type QuoteEstimate } from './QuoteEstimatePanel'
import { QuoteReviewDialog } from './QuoteReviewDialog'
import { QuoteReceivedAt } from './QuoteReceivedAt'
import { NOSY_BE_DEFAULT_OPTION, type NosyBeOption } from '@/lib/nosy-be-option'

type Props = { block: CustomQuoteBlock; locale: Locale; circuits?: Circuit[] }

function getOptionImageUrl(image?: SanityImage): string {
  if (!image) return ''
  try {
    return urlFor(image).width(500).height(340).fit('crop').url()
  } catch {
    return ''
  }
}

export function CustomQuoteForm({ block, locale, circuits = [] }: Props) {
  const t = useTranslations('contactForm')
  const te = useTranslations('quoteEstimate')
  // Circuits à combiner : la durée et le montant du voyage sur mesure en sont le cumul.
  const circuitChoices = circuits.filter((c) => c.slug && c.slug !== 'sur-mesure')
  const [selectedCircuits, setSelectedCircuits] = useState<string[]>([])
  const [durationRows, setDurationRows] = useState<DurationRow[]>([])

  const [regions, setRegions] = useState<string[]>([])
  const [experiences, setExperiences] = useState<string[]>([])
  const [vehicle, setVehicle] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')
  const [receivedAt, setReceivedAt] = useState<string | null>(null)
  const [nosyBeOption, setNosyBeOption] = useState<NosyBeOption>(NOSY_BE_DEFAULT_OPTION)
  const [shippingApplicable, setShippingApplicable] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [consecutiveCircuits, setConsecutiveCircuits] = useState(1)
  const [vehicleCount, setVehicleCount] = useState(1)
  const [estimate, setEstimate] = useState<QuoteEstimate | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const pendingForm = useRef<HTMLFormElement | null>(null)

  const tripDays = (() => {
    if (!startDate || !endDate) return null
    const a = Date.parse(`${startDate}T00:00:00Z`)
    const b = Date.parse(`${endDate}T00:00:00Z`)
    if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null
    return Math.round((b - a) / 86_400_000) + 1
  })()

  useEffect(() => {
    let active = true
    if (selectedCircuits.length === 0) {
      setDurationRows([])
      return () => { active = false }
    }
    getPublicCircuitDurations(selectedCircuits)
      .then((rows) => { if (active) setDurationRows(rows) })
      .catch(() => { if (active) setDurationRows([]) })
    return () => { active = false }
  }, [selectedCircuits])

  const durationRange = useMemo(
    () => circuitDurationRange(durationRows, selectedCircuits, seasonOf(startDate)),
    [durationRows, selectedCircuits, startDate],
  )
  const circuitTitle = (slug: string) => circuitChoices.find((c) => c.slug === slug)?.title || slug

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) =>
    setList(list.includes(val) ? list.filter((x: string) => x !== val) : [...list, val])

  const labels = {
    trip: locale === 'en' ? 'Tailor-made trip' : locale === 'it' ? 'Viaggio su misura' : 'Voyage sur mesure',
    region: locale === 'en' ? 'Regions' : locale === 'it' ? 'Regioni' : 'Régions',
    experience: locale === 'en' ? 'Experiences' : locale === 'it' ? 'Esperienze' : 'Expériences',
    vehicleLabel: locale === 'en' ? 'Vehicle' : locale === 'it' ? 'Veicolo' : 'Véhicule',
    dateStart: locale === 'en' ? 'Departure date' : locale === 'it' ? 'Data di partenza' : 'Date de départ',
    dateEnd: locale === 'en' ? 'Return date' : locale === 'it' ? 'Data di ritorno' : 'Date de retour',
    adults: locale === 'en' ? 'Adults' : locale === 'it' ? 'Adulti' : 'Adultes',
    children: locale === 'en' ? 'Children' : locale === 'it' ? 'Bambini' : 'Enfants',
    firstName: locale === 'en' ? 'First name' : locale === 'it' ? 'Nome' : 'Prénom',
    lastName: locale === 'en' ? 'Last name' : locale === 'it' ? 'Cognome' : 'Nom',
    email: 'E-mail',
    phone: locale === 'en' ? 'Phone / WhatsApp' : locale === 'it' ? 'Telefono / WhatsApp' : 'Téléphone / WhatsApp',
    country: locale === 'en' ? 'Country' : locale === 'it' ? 'Paese' : 'Pays',
    message: locale === 'en' ? 'Your project & notes' : locale === 'it' ? 'Il tuo progetto e note' : 'Votre projet et remarques',
    successTitle: locale === 'en' ? 'Quote request sent' : locale === 'it' ? 'Richiesta inviata' : 'Demande envoyée',
    successRef: locale === 'en' ? 'Reference:' : locale === 'it' ? 'Riferimento:' : 'Référence :',
    successNext:
      locale === 'en'
        ? 'We will get back to you quickly with a tailored proposal.'
        : locale === 'it'
          ? 'Ti ricontatteremo al più presto con una proposta su misura.'
          : 'Nous vous recontacterons rapidement avec une proposition adaptée.',
    another:
      locale === 'en'
        ? 'Send another request'
        : locale === 'it'
          ? 'Invia un’altra richiesta'
          : 'Envoyer une autre demande',
    required:
      locale === 'en'
        ? 'Please fill in your name, email and phone number.'
        : locale === 'it'
          ? 'Compila nome, email e telefono.'
          : 'Merci de renseigner votre prénom, e-mail et téléphone.',
  }

  const regionOptions = block.regions || []
  const experienceOptions = block.experiences || []
  const vehicleOptions = block.vehicles || []

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!reviewOpen) {
      pendingForm.current = e.currentTarget
      setError('')
      setReviewOpen(true)
      return
    }
    await sendRequest(e.currentTarget)
  }

  async function sendRequest(formElement: HTMLFormElement) {
    setError('')
    const fd = new FormData(formElement)
    const firstName = String(fd.get('firstName') || '').trim()
    const lastName = String(fd.get('lastName') || '').trim()
    const email = String(fd.get('email') || '').trim()
    const phone = String(fd.get('phone') || '').trim()

    if (!firstName || !lastName || !email || !phone) {
      setError(labels.required)
      setReviewOpen(false)
      return
    }

    setSending(true)

    const chosenTitles = (options: CustomQuoteOption[], values: string[]) =>
      options.filter((o) => values.includes(o.value)).map((o) => o.title)

    const vehicleTitle = vehicleOptions.find((v) => v.value === vehicle)?.title || ''

    const details = [
      `${labels.region}: ${chosenTitles(regionOptions, regions).join(', ') || '—'}`,
      `${labels.experience}: ${chosenTitles(experienceOptions, experiences).join(', ') || '—'}`,
      ...(selectedCircuits.length ? [`${te('combineTitle')}: ${selectedCircuits.map(circuitTitle).join(', ')}`] : []),
      `${labels.vehicleLabel}: ${vehicleTitle || '—'}`,
      String(fd.get('message') || '').trim(),
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          circuitSlug: 'sur-mesure',
          circuitTitle: selectedCircuits.length ? `${labels.trip} : ${selectedCircuits.map(circuitTitle).join(' + ')}` : labels.trip,
          regions,
          ...(selectedCircuits.length ? { circuitSlugs: selectedCircuits } : {}),
          firstName,
          lastName,
          email,
          phone,
          country: String(fd.get('country') || '').trim(),
          startDate: String(fd.get('startDate') || ''),
          endDate: String(fd.get('endDate') || ''),
          adults: Number(fd.get('adults') || 2),
          children: Number(fd.get('children') || 0),
          vehicleCode: vehicle || '',
          vehicleLabel: vehicleTitle,
          consecutiveCircuits,
          vehicleCount,
          ...(shippingApplicable ? { nosyBeOption } : {}),
          message: details,
          website: String(fd.get('website') || ''),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || t('error'))
      }

      setReference(data.reference || 'OK')
      setReceivedAt(typeof data.createdAt === 'string' ? data.createdAt : null)
      setRegions([])
      setExperiences([])
      setVehicle('')
      setStartDate('')
      setSelectedCircuits([])
      setEndDate('')
      setConsecutiveCircuits(1)
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

  const cardGrid = (
    options: CustomQuoteOption[],
    selected: string[],
    onToggle: (val: string) => void,
    mode: 'checkbox' | 'radio',
    name: string,
  ) => (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((opt) => {
        const active = selected.includes(opt.value)
        const imgUrl = getOptionImageUrl(opt.image)
        return (
          <label
            key={opt.value}
            className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white transition ${
              active
                ? 'border-[#06245F] ring-2 ring-[#06245F]/25'
                : 'border-gray-200 hover:border-[#06245F]/40'
            }`}
          >
            <input
              type={mode}
              name={name}
              value={opt.value}
              checked={active}
              onChange={() => onToggle(opt.value)}
              className="sr-only"
            />
            {imgUrl && (
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                <img
                  src={imgUrl}
                  alt={opt.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                {active && (
                  <span className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#06245F] text-white shadow">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-1 flex-col justify-between p-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-[#06245F]">{opt.title}</span>
                {!imgUrl && active && (
                  <Check className="h-4 w-4 shrink-0 text-[#06245F]" />
                )}
              </div>
              {opt.description && (
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">{opt.description}</p>
              )}
            </div>
          </label>
        )
      })}
    </div>
  )

  // Numérotation des étapes selon celles réellement affichées.
  const stepNo = (() => {
    let n = 0
    const next = (shown: boolean) => (shown ? ++n : n)
    return {
      region: next(regionOptions.length > 0),
      experience: next(experienceOptions.length > 0),
      circuits: next(circuitChoices.length > 0),
      vehicle: next(vehicleOptions.length > 0),
      message: next(true),
    }
  })()

  const stepSection = (num: number, title: string | undefined, children: ReactNode) => {
    if (!title) return null
    return (
      <fieldset className="space-y-4">
        <legend className="flex items-center gap-3 text-lg font-semibold text-[#06245F]">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E0A01C] text-xs font-bold text-white">
            {num}
          </span>
          <span>{title}</span>
        </legend>
        {children}
      </fieldset>
    )
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-[#06245F] focus:outline-none'

  return (
    <section className="container-custom mx-auto max-w-5xl px-4">
      <div className="rounded-3xl bg-[#F8F6F1] p-6 shadow-sm md:p-10">
        {block.title && (
          <h2
            className={`mb-3 text-center ${titleSizeClass(block.titleSize || 'h2')} ${headingFont(block.titleFont, block.title)} ${block.titleWeight || 'font-normal'}`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title, locale)}
          </h2>
        )}
        {block.description && (
          <p className="mx-auto mb-10 max-w-2xl text-center text-gray-600">{block.description}</p>
        )}

        {reference ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
            <p className="text-lg font-semibold text-green-900">{labels.successTitle}</p>
            <p className="mt-2 text-sm text-green-800">
              {labels.successRef} <strong className="font-mono">{reference}</strong>
            </p>
            <p className="mt-1 text-sm text-green-700">{labels.successNext}</p>
            <div>
              <QuoteReceivedAt iso={receivedAt} locale={locale} />
            </div>
            <button
              type="button"
              onClick={() => setReference('')}
              className="mt-6 rounded-full bg-[#06245F] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0b347d]"
            >
              {labels.another}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-10">
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

            {regionOptions.length > 0 &&
              stepSection(stepNo.region, block.regionHeading || labels.region, cardGrid(regionOptions, regions, (v: string) => toggle(regions, setRegions, v), 'checkbox', 'regions'))}

            {experienceOptions.length > 0 &&
              stepSection(stepNo.experience, block.experienceHeading || labels.experience, cardGrid(experienceOptions, experiences, (v: string) => toggle(experiences, setExperiences, v), 'checkbox', 'experiences'))}

            {circuitChoices.length > 0 &&
              stepSection(
                stepNo.circuits,
                te('combineTitle'),
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{te('combineHelp')}</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" data-testid="combine-circuits">
                    {circuitChoices.map((c) => {
                      const active = selectedCircuits.includes(c.slug)
                      const range = durationRange?.perCircuit.find((x) => x.circuitSlug === c.slug)
                      return (
                        <label
                          key={c.slug}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3 text-sm transition ${active ? 'border-[#06245F] ring-2 ring-[#06245F]/20' : 'border-gray-200 hover:border-[#06245F]/40'}`}
                        >
                          <input
                            type="checkbox"
                            name="combineCircuits"
                            value={c.slug}
                            checked={active}
                            onChange={() => toggle(selectedCircuits, setSelectedCircuits, c.slug)}
                            className="mt-0.5 h-4 w-4 accent-[#06245F]"
                          />
                          <span>
                            <span className="block font-medium text-gray-900">{c.title}</span>
                            {range && (
                              <span className="block text-xs text-gray-500">
                                {range.minDays === range.maxDays ? te('days', { days: range.minDays }) : `${range.minDays}–${range.maxDays} j`}
                              </span>
                            )}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                  {durationRange && (
                    <p className="text-sm font-semibold text-[#06245F]" data-testid="combine-total-days">
                      {durationRange.minDays === durationRange.maxDays
                        ? te('days', { days: durationRange.minDays })
                        : `${durationRange.minDays} – ${durationRange.maxDays} ${locale === 'en' ? 'days' : locale === 'it' ? 'giorni' : 'jours'}`}
                    </p>
                  )}
                </div>,
              )}

            {vehicleOptions.length > 0 &&
              stepSection(
                stepNo.vehicle,
                block.vehicleHeading || labels.vehicleLabel,
                cardGrid(vehicleOptions, vehicle ? [vehicle] : [], (v: string) => setVehicle(vehicle === v ? '' : v), 'radio', 'vehicle'),
              )}

            <fieldset className="space-y-4">
              <legend className="flex items-center gap-3 text-lg font-semibold text-[#06245F]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E0A01C] text-xs font-bold text-white">
                  {stepNo.message}
                </span>
                <span>{labels.message}</span>
              </legend>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">{labels.dateStart}</label>
                  <input
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">{labels.dateEnd}</label>
                  <input
                    type="date"
                    name="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">{labels.adults}</label>
                  <input type="number" name="adults" min={1} max={30} defaultValue={2} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">{labels.children}</label>
                  <input type="number" name="children" min={0} max={20} defaultValue={0} className={inputCls} />
                </div>
              </div>

              <QuoteEstimatePanel
                locale={locale}
                days={tripDays}
                minDays={tripDays ? null : durationRange?.minDays ?? null}
                maxDays={tripDays ? null : durationRange?.maxDays ?? null}
                programMinDays={durationRange?.minDays ?? null}
                vehicleCode={vehicle}
                vehicleLabel={vehicleOptions.find((v) => v.value === vehicle)?.title || ''}
                vehicleCount={vehicleCount}
                circuitSlug="sur-mesure"
                circuitTitle={labels.trip}
                regions={[...regions, ...selectedCircuits]}
                nosyBeOption={nosyBeOption}
                onNosyBeOptionChangeAction={setNosyBeOption}
                onShippingApplicableChangeAction={setShippingApplicable}
                onVehicleCountChangeAction={setVehicleCount}
                onEstimateChangeAction={setEstimate}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">{labels.firstName} *</label>
                  <input type="text" name="firstName" required className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">{labels.lastName} *</label>
                  <input type="text" name="lastName" required className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">{labels.email} *</label>
                  <input type="email" name="email" required className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">{labels.phone} *</label>
                  <input type="tel" name="phone" required className={inputCls} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">{labels.country}</label>
                <input type="text" name="country" className={inputCls} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">{labels.message}</label>
                <textarea name="message" rows={4} className={inputCls} />
              </div>
            </fieldset>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#06245F] px-8 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-[#0b347d] disabled:opacity-50"
            >
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              {sending ? t('sending') : block.submitLabel || t('submitQuote')}
            </button>
          </form>
        )}
      </div>
      <QuoteReviewDialog
        open={reviewOpen}
        locale={locale}
        estimate={estimate}
        sending={sending}
        onCancelAction={() => setReviewOpen(false)}
        onConfirmAction={() => { if (pendingForm.current) void sendRequest(pendingForm.current) }}
      />
    </section>
  )
}