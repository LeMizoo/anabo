import { CalendarDays, Car } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n'
import {
  SEASONS,
  formatDays,
  formatEuro,
  formatEuroRange,
  priceRange,
  type CircuitDurations,
  type Vehicle,
} from '@/lib/trip-pricing'
import { titleCase, titleSizeClass } from '@/lib/typography'

type Props = {
  durations?: CircuitDurations
  vehicles: Vehicle[]
  locale: Locale
}

const seasonKey = { dry: 'seasonDry', rainy: 'seasonRainy' } as const

export async function CircuitPricing({ durations, vehicles, locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'pricing' })
  const knownSeasons = SEASONS.filter((season) => durations?.[season])

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

        {knownSeasons.length > 0 && vehicles.length > 0 ? (
          <div className="mt-6 space-y-8">
            {knownSeasons.map((season) => {
              const range = durations![season]!
              return (
                <div key={season}>
                  <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-[#06245F]">
                    <CalendarDays className="h-4 w-4 text-[#E0A01C]" aria-hidden="true" />
                    {t(seasonKey[season])} · {formatDays(range, t)}
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#06245F] shadow-sm">
                            <Car className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{vehicle.name}</p>
                            <p className="text-xs text-slate-500">
                              {t('seats', { count: vehicle.seats })}
                              {vehicle.modelName
                                ? ` · ${t('indicativeModel', { model: vehicle.modelName })}`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <p className="mt-4 text-sm text-slate-600">
                          {t('perDay', { price: formatEuro(vehicle.dailyRate, locale) })}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          {t('total')}
                        </p>
                        <p className="text-2xl font-bold text-[#06245F]">
                          {formatEuroRange(priceRange(range, vehicle.dailyRate), locale)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            <p className="text-xs leading-5 text-slate-500">{t('durationNote')}</p>
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
            {t('durationToDefine')}
          </p>
        )}

        <p className="mt-6 text-xs leading-5 text-slate-500">{t('note')}</p>
      </div>
    </section>
  )
}
