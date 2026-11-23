'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calculator, Info, Loader2 } from 'lucide-react'
import {
  calculateTripVehiclePriceAction,
  getPublicDepositInfoAction,
  listPublicVehiclesAction,
  type PublicVehicleOption,
} from '@/lib/trip-pricing-actions'

export type QuoteEstimate = {
  depositPercent: number
  paymentMethod: string
  currency: string | null
  totalMin: number | null
  totalMax: number | null
  depositMin: number | null
  depositMax: number | null
  days: number | null
  dayRange: { min: number; max: number } | null
  vehicleName: string | null
}

type Props = {
  locale: string
  vehicleCode: string
  vehicleCount: number
  /** Nombre de jours exact (dates renseignées), sinon null */
  days: number | null
  /** Fourchette de durée du circuit, utilisée tant que les dates ne sont pas connues */
  dayRange?: { min: number; max: number } | null
  /** Affiche le choix du véhicule et du nombre de véhicules dans le panneau */
  withVehicleFields?: boolean
  onVehicleChange?: (code: string, label: string) => void
  onVehicleCountChange?: (count: number) => void
  onEstimateChange?: (estimate: QuoteEstimate) => void
  disabled?: boolean
}

const intlLocale = (l: string) => (l === 'en' ? 'en-GB' : l === 'it' ? 'it-IT' : 'fr-FR')

export function formatMoney(value: number, currency: string | null, locale: string) {
  try {
    return new Intl.NumberFormat(intlLocale(locale), { style: 'currency', currency: currency || 'EUR', maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${value} ${currency || 'EUR'}`
  }
}

export function formatRange(min: number | null, max: number | null, currency: string | null, locale: string) {
  if (min === null) return null
  return max !== null && max !== min
    ? `${formatMoney(min, currency, locale)} – ${formatMoney(max, currency, locale)}`
    : formatMoney(min, currency, locale)
}

export function QuoteEstimatePanel({
  locale, vehicleCode, vehicleCount, days, dayRange = null, withVehicleFields = false,
  onVehicleChange, onVehicleCountChange, onEstimateChange, disabled,
}: Props) {
  const t = useTranslations('quoteEstimate')
  const [deposit, setDeposit] = useState({ percent: 30, method: 'Mobile Money' })
  const [vehicles, setVehicles] = useState<PublicVehicleOption[]>([])
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'unavailable' | 'error'>('idle')
  const [result, setResult] = useState<{ min: number; max: number; currency: string; vehicleName: string } | null>(null)

  useEffect(() => {
    getPublicDepositInfoAction().then(setDeposit).catch(() => undefined)
    if (withVehicleFields) listPublicVehiclesAction().then(setVehicles).catch(() => undefined)
  }, [withVehicleFields])

  const minDays = days ?? dayRange?.min ?? null
  const maxDays = days ?? dayRange?.max ?? null

  // Calcul automatique (avec un petit délai pour ne pas solliciter le serveur à chaque frappe).
  useEffect(() => {
    if (!vehicleCode || !minDays || !maxDays) {
      setResult(null)
      setState('idle')
      return
    }
    let cancelled = false
    setState('loading')
    const timer = setTimeout(async () => {
      try {
        const count = Math.min(20, Math.max(1, vehicleCount || 1))
        const [a, b] = await Promise.all([
          calculateTripVehiclePriceAction({ vehicleCode, days: minDays, vehicleCount: count }),
          maxDays !== minDays ? calculateTripVehiclePriceAction({ vehicleCode, days: maxDays, vehicleCount: count }) : Promise.resolve(null),
        ])
        if (cancelled) return
        if (!a) { setResult(null); setState('unavailable'); return }
        setResult({ min: a.total, max: b?.total ?? a.total, currency: a.currency, vehicleName: a.vehicleName })
        setState('ready')
      } catch {
        if (!cancelled) { setResult(null); setState('error') }
      }
    }, 400)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [vehicleCode, vehicleCount, minDays, maxDays])

  // Remonte l'estimation au formulaire (utilisée dans le récapitulatif avant envoi).
  useEffect(() => {
    const dep = (v: number) => Math.ceil((v * deposit.percent) / 100)
    onEstimateChange?.({
      depositPercent: deposit.percent,
      paymentMethod: deposit.method,
      currency: result?.currency ?? null,
      totalMin: result?.min ?? null,
      totalMax: result?.max ?? null,
      depositMin: result ? dep(result.min) : null,
      depositMax: result ? dep(result.max) : null,
      days,
      dayRange: days ? null : dayRange,
      vehicleName: result?.vehicleName ?? null,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, deposit, days, dayRange?.min, dayRange?.max])

  const select =
    'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:bg-gray-100'

  return (
    <div className="space-y-4 rounded-xl border border-blue-100 bg-white p-4 text-sm text-slate-800 md:p-5">
      <p className="flex items-center gap-2 text-base font-semibold text-[#06245F]">
        <Calculator className="h-5 w-5 text-[#E0A01C]" aria-hidden="true" />
        {t('title')}
      </p>

      {deposit.percent > 0 && (
        <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-950">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t('depositNotice', { percent: deposit.percent })}</span>
        </p>
      )}

      {withVehicleFields && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('vehicle')}
            <select
              className={select}
              value={vehicleCode}
              disabled={disabled}
              onChange={(e) => {
                const v = vehicles.find((x) => x.code === e.target.value)
                onVehicleChange?.(e.target.value, v?.name || '')
              }}
            >
              <option value="">{t('vehiclePlaceholder')}</option>
              {vehicles.map((v) => (
                <option key={v.code} value={v.code}>
                  {v.name} — {t('seats', { count: v.capacity })}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            {t('vehicleCount')}
            <input
              className={select}
              type="number"
              min={1}
              max={20}
              value={vehicleCount}
              disabled={disabled}
              onChange={(e) => onVehicleCountChange?.(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
            />
          </label>
        </div>
      )}

      <div aria-live="polite">
        {!vehicleCode ? (
          <p className="text-slate-500">{t('needVehicle')}</p>
        ) : !minDays ? (
          <p className="text-slate-500">{t('needDates')}</p>
        ) : state === 'loading' ? (
          <p className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{t('calculating')}</p>
        ) : state === 'unavailable' ? (
          <p className="text-slate-600">{t('unavailable')}</p>
        ) : state === 'error' ? (
          <p className="text-slate-600">{t('error')}</p>
        ) : result ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-2">
              <span className="text-slate-600">
                {days ? t('total') : t('totalRange')}
                <span className="block text-xs text-slate-400">
                  {result.vehicleName} · {days ? t('days', { days }) : t('days', { days: `${dayRange?.min}–${dayRange?.max}` })}
                </span>
              </span>
              <span className="text-xl font-bold text-[#06245F]">{formatRange(result.min, result.max, result.currency, locale)}</span>
            </div>
            {deposit.percent > 0 && (
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-slate-600">{t('deposit', { percent: deposit.percent })}</span>
                <span className="text-lg font-semibold text-[#E0A01C]">
                  {formatRange(Math.ceil((result.min * deposit.percent) / 100), Math.ceil((result.max * deposit.percent) / 100), result.currency, locale)}
                </span>
              </div>
            )}
            <p className="text-xs text-slate-500">{t('indicative')}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
