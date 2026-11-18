import { CalendarDays, Car, Bus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n'
import {
  computeCircuitPrice,
  dailyRateFor,
  formatEuro,
  isValidTotalDays,
  modelFor,
  type VehicleRates,
  type VehicleType,
} from '@/lib/pricing'
import { titleCase, titleSizeClass } from '@/lib/typography'
import type { StopDay } from '@/lib/types'

type Props = {
  totalDays?: number
  stopDays?: StopDay[]
  rates: VehicleRates
  locale: Locale
}

const vehicles: { type: VehicleType; icon: typeof Car; labelKey: 'vehicle4x4' | 'vehicleMinivan' }[] = [
  { type: '4x4', icon: Car, labelKey: 'vehicle4x4' },
  { type: 'minivan', icon: Bus, labelKey: 'vehicleMinivan' },
]

export async function CircuitPricing({ totalDays, stopDays, rates, locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'pricing' })
  const validStops = (stopDays ?? []).filter(
    (stop) => stop?.place && typeof stop.days === 'number' && stop.days > 0,
  )

  return (
    <section className="container-custom pb-10 md:pb-14" aria-labelledby="circuit-pricing-title">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2
          id="circuit-pricing-title"
          className={`font-caflisch font-normal text-[#06245F] ${titleSizeClass('lg')}`}
        >
          {titleCase(t('title'), locale)}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t('subtitle')}</p>

        {isValidTotalDays(totalDays) ? (
          <>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-[#06245F]">
              <CalendarDays className="h-4 w-4 text-[#E0A01C]" aria-hidden="true" />
              {t('totalDays', { count: totalDays })}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {vehicles.map(({ type, icon: Icon, labelKey }) => {
                const dailyRate = dailyRateFor(rates, type)
                const total = computeCircuitPrice(totalDays, dailyRate)

                return (
                  <div
                    key={type}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#06245F] shadow-sm">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{t(labelKey)}</p>
                        <p className="text-xs text-slate-500">
                          {t('indicativeModel', { model: modelFor(rates, type) })}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">
                      {t('perDay', { price: formatEuro(dailyRate, locale) })}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {t('total')}
                    </p>
                    <p className="text-3xl font-bold text-[#06245F]">{formatEuro(total, locale)}</p>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
            {t('durationToDefine')}
          </p>
        )}

        {validStops.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
              {t('stopsTitle')}
            </h3>
            <ol className="mt-3 flex flex-wrap gap-2">
              {validStops.map((stop, index) => (
                <li
                  key={stop._key ?? `${stop.place}-${index}`}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                >
                  <span>{stop.place.replace(/, Madagascar$/, '')}</span>
                  <span className="rounded-full bg-[#E0A01C]/15 px-2 py-0.5 text-xs font-semibold text-[#8a5f00]">
                    {t('days', { count: stop.days })}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <p className="mt-6 text-xs leading-5 text-slate-500">{t('note')}</p>
      </div>
    </section>
  )
}
