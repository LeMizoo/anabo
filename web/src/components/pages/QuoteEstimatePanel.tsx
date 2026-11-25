'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Car, Fuel, Info, Loader2 } from 'lucide-react'
import {
  calculateTripVehiclePriceAction,
  getPublicDepositInfoAction,
  listPublicVehiclesAction,
  type PublicVehicleOption,
} from '@/lib/trip-pricing-actions'

export type QuoteEstimate = {
  totalMin: number
  totalMax: number
  depositMin: number
  depositMax: number
  depositPercent: number
  paymentMethod: string
  currency: string
  indicativeOnly: boolean
  days: number | null
  vehicleName: string | null
}

type Props = {
  locale: string
  /** Nombre de jours si les dates sont connues ; sinon une fourchette indicative peut être passée. */
  days: number | null
  minDays?: number | null
  maxDays?: number | null
  vehicleCode: string
  vehicleLabel?: string
  vehicleCount: number
  destination?: string | null
  circuitSlug?: string | null
  circuitTitle?: string | null
  regions?: string[] | null
  onVehicleChangeAction?: (code: string, label: string) => void
  onVehicleCountChangeAction?: (count: number) => void
  onEstimateChangeAction?: (estimate: QuoteEstimate | null) => void
}

function formatMoney(amount: number, currency: string, locale: string): string {
  const intlLocale = locale === 'en' ? 'en-GB' : locale === 'it' ? 'it-IT' : 'fr-FR'
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${Math.round(amount).toLocaleString(intlLocale)} ${currency}`
  }
}

export function formatRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string,
  locale: string,
): string | null {
  if (typeof min !== 'number' || typeof max !== 'number') return null
  if (min === max) return formatMoney(min, currency, locale)
  return `${formatMoney(min, currency, locale)} – ${formatMoney(max, currency, locale)}`
}

export function QuoteEstimatePanel({
  locale,
  days,
  minDays,
  maxDays,
  vehicleCode,
  vehicleLabel,
  vehicleCount,
  destination = null,
  circuitSlug = null,
  circuitTitle = null,
  regions = null,
  onVehicleChangeAction,
  onVehicleCountChangeAction,
  onEstimateChangeAction,
}: Props) {
  const t = useTranslations('quoteEstimate')
  const [vehicles, setVehicles] = useState<PublicVehicleOption[]>([])
  const [depositInfo, setDepositInfo] = useState<{ percent: number; method: string }>({
    percent: 30,
    method: 'Mobile Money',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable' | 'error'>('idle')
  const [estimate, setEstimate] = useState<QuoteEstimate | null>(null)

  const regionsKey = Array.isArray(regions) ? regions.join('|') : ''

  useEffect(() => {
    let active = true
    void listPublicVehiclesAction().then((list) => {
      if (active) setVehicles(list)
    })
    void getPublicDepositInfoAction().then((info) => {
      if (active) setDepositInfo(info)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const publish = (next: QuoteEstimate | null) => {
      if (!active) return
      setEstimate(next)
      onEstimateChangeAction?.(next)
    }

    if (!vehicleCode) {
      setStatus('idle')
      publish(null)
      return
    }

    const safeCount = Number.isFinite(vehicleCount) && vehicleCount >= 1 ? Math.min(20, Math.floor(vehicleCount)) : 1
    const normalizedRegions = Array.isArray(regions)
      ? regions.map((r) => r.trim()).filter(Boolean)
      : null

    const runSingle = async (d: number) =>
      calculateTripVehiclePriceAction({
        vehicleCode,
        days: d,
        vehicleCount: safeCount,
        destination,
        circuitSlug,
        circuitTitle,
        regions: normalizedRegions,
      })

    const hasExactDays = typeof days === 'number' && Number.isInteger(days) && days >= 1
    const hasRange =
      typeof minDays === 'number' &&
      typeof maxDays === 'number' &&
      Number.isInteger(minDays) &&
      Number.isInteger(maxDays) &&
      minDays >= 1 &&
      maxDays >= minDays

    if (!hasExactDays && !hasRange) {
      setStatus('idle')
      publish(null)
      return
    }

    setStatus('loading')

    const compute = async () => {
      try {
        if (hasExactDays) {
          const res = await runSingle(days)
          if (!active) return
          if (!res) {
            setStatus('unavailable')
            publish(null)
            return
          }
          const pct = depositInfo.percent
          setStatus('ready')
          publish({
            totalMin: res.total,
            totalMax: res.total,
            depositMin: Math.round((res.total * pct) / 100),
            depositMax: Math.round((res.total * pct) / 100),
            depositPercent: pct,
            paymentMethod: depositInfo.method,
            currency: res.currency,
            indicativeOnly: res.indicativeOnly,
            days: res.days,
            vehicleName: res.vehicleName,
          })
          return
        }

        const [low, high] = await Promise.all([runSingle(minDays!), runSingle(maxDays!)])
        if (!active) return
        if (!low || !high) {
          setStatus('unavailable')
          publish(null)
          return
        }
        const pct = depositInfo.percent
        const minTotal = Math.min(low.total, high.total)
        const maxTotal = Math.max(low.total, high.total)
        setStatus('ready')
        publish({
          totalMin: minTotal,
          totalMax: maxTotal,
          depositMin: Math.round((minTotal * pct) / 100),
          depositMax: Math.round((maxTotal * pct) / 100),
          depositPercent: pct,
          paymentMethod: depositInfo.method,
          currency: low.currency,
          indicativeOnly: low.indicativeOnly || high.indicativeOnly,
          days: null,
          vehicleName: low.vehicleName,
        })
      } catch {
        if (!active) return
        setStatus('error')
        publish(null)
      }
    }

    void compute()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    vehicleCode,
    vehicleCount,
    days,
    minDays,
    maxDays,
    destination,
    circuitSlug,
    circuitTitle,
    regionsKey,
    depositInfo.percent,
    depositInfo.method,
  ])

  const totalText = estimate ? formatRange(estimate.totalMin, estimate.totalMax, estimate.currency, locale) : null
  const depositText = estimate ? formatRange(estimate.depositMin, estimate.depositMax, estimate.currency, locale) : null

  return (
    <div className="space-y-4 rounded-2xl border border-[#06245F]/15 bg-[#F8F6F1] p-5">
      <div className="flex items-center gap-2 text-[#06245F]">
        <Car className="h-5 w-5 text-[#E0A01C]" aria-hidden="true" />
        <h3 className="font-sans text-base font-semibold">{t('title')}</h3>
      </div>

      <div className="space-y-2 rounded-xl bg-white/80 p-3 text-xs leading-5 text-slate-600">
        {depositInfo.percent > 0 && (
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#06245F]" aria-hidden="true" />
            <span>{t('depositNotice', { percent: depositInfo.percent })}</span>
          </p>
        )}
        <p className="flex items-start gap-2" data-testid="fuel-notice">
          <Fuel className="mt-0.5 h-4 w-4 shrink-0 text-[#E0A01C]" aria-hidden="true" />
          <span>{t('fuelNotice')}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {onVehicleChangeAction && (
          <div>
            <label htmlFor="quote-vehicle-select" className="mb-1.5 block text-sm font-medium text-[#06245F]">
              {t('vehicle')}
            </label>
            <select
              id="quote-vehicle-select"
              value={vehicleCode}
              onChange={(e) => {
                const code = e.target.value
                const found = vehicles.find((v) => v.code === code)
                onVehicleChangeAction(code, found?.name || '')
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 focus:border-[#06245F] focus:outline-none"
            >
              <option value="">{t('vehiclePlaceholder')}</option>
              {vehicles.map((v) => (
                <option key={v.code} value={v.code}>
                  {v.name} ({t('seats', { count: v.capacity })})
                </option>
              ))}
            </select>
            {vehicleCode && !vehicles.some((v) => v.code === vehicleCode) && vehicleLabel && (
              <p className="mt-1 text-xs text-slate-500">{vehicleLabel}</p>
            )}
          </div>
        )}

        {onVehicleCountChangeAction && (
          <div>
            <label htmlFor="quote-vehicle-count" className="mb-1.5 block text-sm font-medium text-[#06245F]">
              {t('vehicleCount')}
            </label>
            <input
              id="quote-vehicle-count"
              type="number"
              min={1}
              max={20}
              value={vehicleCount}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                onVehicleCountChangeAction(Number.isFinite(n) && n >= 1 ? Math.min(20, n) : 1)
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 focus:border-[#06245F] focus:outline-none"
            />
          </div>
        )}
      </div>

      {status === 'idle' && !vehicleCode && (
        <p className="text-sm text-slate-600">{t('needVehicle')}</p>
      )}
      {status === 'idle' && vehicleCode && (
        <p className="text-sm text-slate-600">{t('needDates')}</p>
      )}
      {status === 'loading' && (
        <p className="inline-flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-[#06245F]" aria-hidden="true" />
          {t('calculating')}
        </p>
      )}
      {status === 'unavailable' && (
        <p className="text-sm text-amber-800">{t('unavailable')}</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-amber-800">{t('error')}</p>
      )}

      {status === 'ready' && estimate && totalText && (
        <div className="space-y-2 rounded-xl border border-[#06245F]/10 bg-white p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm text-slate-600">
              {estimate.days ? t('total') : t('totalRange')}
              {estimate.days ? ` (${t('days', { days: estimate.days })})` : ''}
            </span>
            <strong className="text-lg font-bold text-[#06245F]">{totalText}</strong>
          </div>

          {estimate.depositPercent > 0 && depositText && (
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-100 pt-2">
              <span className="text-sm text-slate-600">{t('deposit', { percent: estimate.depositPercent })}</span>
              <strong className="text-base font-semibold text-[#E0A01C]">{depositText}</strong>
            </div>
          )}

          <p className="pt-1 text-xs text-slate-500">{t('includes')}</p>
          <p className="text-xs text-slate-500">{t('indicative')}</p>
        </div>
      )}
    </div>
  )
}