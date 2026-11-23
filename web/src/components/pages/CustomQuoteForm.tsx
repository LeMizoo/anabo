
'use client'

import Image from 'next/image'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { getImageUrl } from '@/lib/sanity'
import { brandTextColor, titleCase, titleSizeClass, headingFont } from '@/lib/typography'
import type { CustomQuoteBlock, CustomQuoteOption } from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import {
  calculateTripVehiclePriceAction,
  type PublicTripVehicleEstimate,
} from '@/lib/trip-pricing-actions'

type Props = { block: CustomQuoteBlock; locale: Locale }

export function CustomQuoteForm({ block, locale }: Props) {
  const t = useTranslations('contactForm')

  const [regions, setRegions] = useState<string[]>([])
  const [experiences, setExperiences] = useState<string[]>([])
  const [vehicle, setVehicle] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [estimate, setEstimate] =
    useState<PublicTripVehicleEstimate | null>(null)

  const [estimating, setEstimating] = useState(false)
  const [consecutiveCircuits, setConsecutiveCircuits] = useState(1)
  const [vehicleCount, setVehicleCount] = useState(1)

  const regionNames = block.regions || []
  const experienceNames = block.experiences || []
  const vehicles = block.vehicles || []

  const labels = {
    fr: {
      requiredRegion: 'Choisissez au moins une région.',
      vehicle: 'Véhicule préféré',
      regions: 'Régions',
      experiences: 'Expériences',
      trip: 'Voyage sur mesure',
      region: 'Régions souhaitées',
      experience: 'Expériences souhaitées',
      vehicleLabel: 'Véhicule',
      multiple: '(plusieurs choix)',
      selected: 'Sélectionné',
      select: 'Sélectionner',
      duration: 'Durée de votre séjour',
      durationDay: 'jour',
      durationDays: 'jours',
      invalidDates: 'La date de retour doit être postérieure ou égale à la date de départ.',
      needDatesVehicle: 'Indiquez les dates et choisissez un véhicule pour obtenir une estimation.',
      checkDates: 'Vérifiez les dates de votre voyage.',
      noRate: 'Aucun tarif n’est configuré pour ce véhicule. Contactez-nous pour un devis personnalisé.',
      estimateError: 'Impossible de calculer le prix indicatif pour le moment.',
      vehicleNote: 'Tarifs des véhicules à titre indicatif. Le prix final dépend de la disponibilité et de la saison ; il sera confirmé après votre demande.',
      indicativeNote: 'Le tarif du véhicule est indicatif, sous réserve de disponibilité et de saison. Confirmation après étude de la demande.',
      estimateFor: (days: number, vehicleName: string) => `Prix indicatif estimé pour ${days} jour${days > 1 ? 's' : ''} avec ${vehicleName}. Toute négociation est possible sur place à Madagascar, selon la durée de votre séjour.`,
      consecutive: 'Circuits consécutifs',
      vehiclesRequested: 'Véhicules demandés',
      calculating: 'Calcul en cours…',
      calculate: 'Calculer le prix indicatif',
    },
    en: {
      requiredRegion: 'Choose at least one region.',
      vehicle: 'Preferred vehicle',
      regions: 'Regions',
      experiences: 'Experiences',
      trip: 'Tailor-made trip',
      region: 'Preferred regions',
      experience: 'Preferred experiences',
      vehicleLabel: 'Vehicle',
      multiple: '(choose all that apply)',
      selected: 'Selected',
      select: 'Select',
      duration: 'Length of your stay',
      durationDay: 'day',
      durationDays: 'days',
      invalidDates: 'The return date must be on or after the departure date.',
      needDatesVehicle: 'Enter your dates and choose a vehicle to get an estimate.',
      checkDates: 'Please check your travel dates.',
      noRate: 'No rate is set for this vehicle yet. Contact us for a personalised quote.',
      estimateError: 'The indicative price cannot be calculated right now.',
      vehicleNote: 'Vehicle rates are indicative. The final price depends on availability and season and will be confirmed after your request.',
      indicativeNote: 'The vehicle rate is indicative, subject to availability and season. Confirmed once your request has been reviewed.',
      estimateFor: (days: number, vehicleName: string) => `Indicative price for ${days} day${days > 1 ? 's' : ''} with ${vehicleName}. Prices can be discussed in Madagascar depending on the length of your stay.`,
      consecutive: 'Consecutive circuits',
      vehiclesRequested: 'Vehicles requested',
      calculating: 'Calculating…',
      calculate: 'Calculate the indicative price',
    },
    it: {
      requiredRegion: 'Scegli almeno una regione.',
      vehicle: 'Veicolo preferito',
      regions: 'Regioni',
      experiences: 'Esperienze',
      trip: 'Viaggio su misura',
      region: 'Regioni desiderate',
      experience: 'Esperienze desiderate',
      vehicleLabel: 'Veicolo',
      multiple: '(puoi scegliere più opzioni)',
      selected: 'Selezionato',
      select: 'Seleziona',
      duration: 'Durata del soggiorno',
      durationDay: 'giorno',
      durationDays: 'giorni',
      invalidDates: 'La data di ritorno deve essere uguale o successiva alla data di partenza.',
      needDatesVehicle: 'Indica le date e scegli un veicolo per ottenere una stima.',
      checkDates: 'Verifica le date del tuo viaggio.',
      noRate: 'Nessuna tariffa è ancora configurata per questo veicolo. Contattaci per un preventivo personalizzato.',
      estimateError: 'Al momento non è possibile calcolare il prezzo indicativo.',
      vehicleNote: 'Le tariffe dei veicoli sono indicative. Il prezzo finale dipende da disponibilità e stagione e sarà confermato dopo la tua richiesta.',
      indicativeNote: 'La tariffa del veicolo è indicativa, soggetta a disponibilità e stagione. Conferma dopo l’esame della richiesta.',
      estimateFor: (days: number, vehicleName: string) => `Prezzo indicativo per ${days} giorn${days > 1 ? 'i' : 'o'} con ${vehicleName}. Il prezzo è trattabile in Madagascar in base alla durata del soggiorno.`,
      consecutive: 'Circuiti consecutivi',
      vehiclesRequested: 'Veicoli richiesti',
      calculating: 'Calcolo in corso…',
      calculate: 'Calcola il prezzo indicativo',
    },
  }[locale]

  const inputClass =
    'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-gray-100'

  // Même règle que l'estimation du prix (serveur) : jours inclus,
  // du 1er au 5 = 5 jours ; une seule date = 1 jour.
  const startTime = startDate
    ? Date.parse(`${startDate}T00:00:00Z`)
    : Number.NaN

  const endTime = endDate
    ? Date.parse(`${endDate}T00:00:00Z`)
    : Number.NaN

  const datesAreValid =
    Number.isFinite(startTime) &&
    Number.isFinite(endTime) &&
    endTime >= startTime

  const durationDays = datesAreValid
    ? Math.round((endTime - startTime) / 86400000) + 1
    : null

  function handleDateChange(type: 'start' | 'end', value: string) {
    if (type === 'start') {
      setStartDate(value)
    } else {
      setEndDate(value)
    }

    // L'estimation précédente ne correspond plus nécessairement aux dates.
    setEstimate(null)
    setError('')
  }

  async function updateEstimate(form?: HTMLFormElement) {
    if (!form) return

    setError('')

    if (!startDate || !endDate || !vehicle) {
      setError(labels.needDatesVehicle)
      return
    }

    if (!datesAreValid || durationDays === null) {
      setError(labels.checkDates)
      setEstimate(null)
      return
    }

    setEstimating(true)

    try {
      const result = await calculateTripVehiclePriceAction({
        vehicleCode: vehicle,
        days: durationDays,
        vehicleCount,
      })

      if (!result) {
        setError(labels.noRate)
        setEstimate(null)
        return
      }

      setEstimate({
        total: result.total,
        currency: result.currency,
        indicativeOnly: result.indicativeOnly,
        days: result.days,
        vehicleName: result.vehicleName,
      })
    } catch {
      setError(labels.estimateError)
      setEstimate(null)
    } finally {
      setEstimating(false)
    }
  }

  function toggleValue(
    value: string,
    selected: string[],
    update: (value: string[]) => void
  ) {
    update(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    )
  }

  function optionCard(
    option: CustomQuoteOption,
    active: boolean,
    onClick: () => void,
    mode: 'multi' | 'single'
  ): ReactNode {
    const imageUrl = option.image
      ? getImageUrl(option.image, 360, 75)
      : null

    return (
      <button
        key={option._key || option.value}
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={`group relative flex min-h-24 w-full items-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06245F] ${
          active
            ? 'border-[#E0A01C] bg-amber-50 ring-2 ring-[#E0A01C]'
            : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm'
        }`}
      >
        {imageUrl && option.image && (
          <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            <Image
              src={imageUrl}
              alt={option.image.alt || ''}
              fill
              sizes="80px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-slate-900">
            {option.title}
          </span>

          {option.description && (
            <span className="mt-1 block text-sm leading-5 text-slate-600">
              {option.description}
            </span>
          )}
        </span>

        <span
          aria-hidden="true"
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
            active
              ? 'border-[#06245F] bg-[#06245F] text-white'
              : 'border-slate-300 text-transparent'
          }`}
        >
          <Check className="h-4 w-4" />
        </span>

        <span className="sr-only">
          {mode === 'single'
            ? labels.vehicle
            : active
              ? labels.selected
              : labels.select}
        </span>
      </button>
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formElement = event.currentTarget

    setError('')
    setReference('')

    if (regions.length === 0) {
      setError(labels.requiredRegion)
      return
    }

    setSending(true)

    const form = new FormData(formElement)

    const chosenTitles = (
      options: CustomQuoteOption[],
      values: string[]
    ) =>
      options
        .filter((option) => values.includes(option.value))
        .map((option) => option.title)

    const vehicleTitle =
      vehicles.find((option) => option.value === vehicle)?.title || ''

    const details = [
      `${labels.region}: ${chosenTitles(regionNames, regions).join(', ')}`,
      `${labels.experience}: ${
        chosenTitles(experienceNames, experiences).join(', ') || '—'
      }`,
      `${labels.vehicleLabel}: ${vehicleTitle || '—'}`,
      String(form.get('message') || '').trim(),
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          circuitSlug: 'sur-mesure',
          circuitTitle: labels.trip,
          firstName: String(form.get('firstName') || '').trim(),
          lastName: String(form.get('lastName') || '').trim(),
          email: String(form.get('email') || '').trim(),
          phone: String(form.get('phone') || '').trim(),
          country: String(form.get('country') || '').trim(),
          startDate: String(form.get('startDate') || ''),
          endDate: String(form.get('endDate') || ''),
          adults: Number(form.get('adults') || 2),
          children: Number(form.get('children') || 0),
          vehicleCode: vehicle || '',
          vehicleLabel: vehicleTitle,
          consecutiveCircuits,
          vehicleCount,
          message: details,
          website: String(form.get('website') || ''),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        const fieldErrors = result.fields
          ? Object.values(result.fields).flat().filter(Boolean).join(' ')
          : ''

        throw new Error(fieldErrors || result.error || t('error'))
      }

      setEstimate(result.estimate || null)
      setReference(result.reference || '')

      formElement.reset()
      setRegions([])
      setExperiences([])
      setVehicle('')
      setStartDate('')
      setEndDate('')
      setConsecutiveCircuits(1)
      setVehicleCount(1)
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : t('error')
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="container-custom mx-auto max-w-6xl px-4">
      <div className="rounded-3xl bg-[#F8F6F1] p-5 md:p-9">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2
            className={`${titleSizeClass(block.titleSize || 'h2')} ${
              headingFont(block.titleFont, block.title)
            } ${block.titleWeight || 'font-normal'} text-[#06245F]`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title, locale)}
          </h2>

          {block.description && (
            <p className="mt-3 leading-relaxed text-slate-600">
              {block.description}
            </p>
          )}
        </div>

        {reference ? (
          <div
            className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900"
            role="status"
            aria-live="polite"
          >
            <Check
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <p>
              {t('success')} {t('reference')}:{' '}
              <strong>{reference}</strong>
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-4xl space-y-8"
            aria-busy={sending}
          >
            {regionNames.length > 0 && (
              <fieldset>
                <legend className="mb-3 text-lg font-semibold text-[#06245F]">
                  {block.regionHeading || labels.regions}{' '}
                  <span className="text-sm font-normal text-slate-500">
                    {labels.multiple}
                  </span>
                </legend>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {regionNames.map((option) =>
                    optionCard(
                      option,
                      regions.includes(option.value),
                      () =>
                        toggleValue(option.value, regions, setRegions),
                      'multi'
                    )
                  )}
                </div>
              </fieldset>
            )}

            {experienceNames.length > 0 && (
              <fieldset>
                <legend className="mb-3 text-lg font-semibold text-[#06245F]">
                  {block.experienceHeading || labels.experiences}{' '}
                  <span className="text-sm font-normal text-slate-500">
                    {labels.multiple}
                  </span>
                </legend>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {experienceNames.map((option) =>
                    optionCard(
                      option,
                      experiences.includes(option.value),
                      () =>
                        toggleValue(
                          option.value,
                          experiences,
                          setExperiences
                        ),
                      'multi'
                    )
                  )}
                </div>
              </fieldset>
            )}

            {vehicles.length > 0 && (
              <fieldset>
                <legend className="mb-3 text-lg font-semibold text-[#06245F]">
                  {block.vehicleHeading || labels.vehicle}
                </legend>

                <div className="grid gap-3 sm:grid-cols-2">
                  {vehicles.map((option) =>
                    optionCard(
                      option,
                      vehicle === option.value,
                      () => {
                        setVehicle(vehicle === option.value ? '' : option.value)
                        setEstimate(null)
                        setError('')
                      },
                      'single'
                    )
                  )}
                </div>

                {vehicle && estimate?.indicativeOnly && (
                  <p className="mt-3 text-sm text-slate-600">
                    {labels.vehicleNote}
                  </p>
                )}
              </fieldset>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                {t('startDate')}
                <input
                  className={inputClass}
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    handleDateChange('start', event.target.value)
                  }
                  disabled={sending}
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                {t('endDate')}
                <input
                  className={inputClass}
                  name="endDate"
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    handleDateChange('end', event.target.value)
                  }
                  disabled={sending}
                />
              </label>

              {durationDays !== null && (
                <div
                  className="sm:col-span-2 rounded-xl border border-blue-100 bg-white px-4 py-3"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-sm font-medium text-slate-600">
                    {labels.duration}
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#06245F]">
                    {durationDays}{' '}
                    {durationDays > 1 ? labels.durationDays : labels.durationDay}
                  </p>
                </div>
              )}

              {startDate && endDate && !datesAreValid && (
                <p
                  className="sm:col-span-2 text-sm text-red-700"
                  role="alert"
                >
                  {labels.invalidDates}
                </p>
              )}

              <label className="text-sm font-medium text-slate-700">
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

              <label className="text-sm font-medium text-slate-700">
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

              <label className="text-sm font-medium text-slate-700">
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

              <label className="text-sm font-medium text-slate-700">
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

              <label className="text-sm font-medium text-slate-700">
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

              <label className="text-sm font-medium text-slate-700">
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

              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
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

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                {labels.consecutive}
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  max={20}
                  value={consecutiveCircuits}
                  onChange={(event) =>
                    setConsecutiveCircuits(
                      Math.min(20, Math.max(1, Number(event.target.value) || 1))
                    )
                  }
                  disabled={sending}
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                {labels.vehiclesRequested}
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  max={20}
                  value={vehicleCount}
                  onChange={(event) => {
                    setVehicleCount(
                      Math.min(20, Math.max(1, Number(event.target.value) || 1))
                    )
                    setEstimate(null)
                  }}
                  disabled={sending}
                />
              </label>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white p-4">
              <button
                type="button"
                onClick={(event) =>
                  updateEstimate(event.currentTarget.form || undefined)
                }
                disabled={estimating || sending}
                className="rounded-lg border border-[#06245F] px-4 py-2 font-semibold text-[#06245F] disabled:opacity-60"
              >
                {estimating ? labels.calculating : labels.calculate}
              </button>

              {estimate && (
                <div className="mt-4 space-y-2" aria-live="polite">
                  <p className="text-2xl font-bold text-slate-900">
                    {new Intl.NumberFormat(locale, {
                      style: 'currency',
                      currency: estimate.currency,
                      maximumFractionDigits: 0,
                    }).format(estimate.total)}
                  </p>

                  {estimate.indicativeOnly && (
                    <p className="text-sm text-amber-800">
                      {labels.indicativeNote}
                    </p>
                  )}

                  <p className="text-sm text-slate-600">
                    {labels.estimateFor(estimate.days, estimate.vehicleName)}
                  </p>
                </div>
              )}
            </div>

            {/* Champ piège anti-spam, invisible pour les visiteurs */}
            <div className="hidden" aria-hidden="true">
              <label>
                Website
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              {t('message')}
              <textarea
                className={inputClass}
                name="message"
                rows={4}
                maxLength={4000}
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
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#06245F] px-8 py-3 font-semibold text-white transition hover:bg-[#0b347d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06245F] focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {sending && (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {sending ? t('sending') : block.submitLabel || t('submitQuote')}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
