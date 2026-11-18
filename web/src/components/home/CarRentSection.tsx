import Link from 'next/link'
import { ArrowRight, Bus, Car, Languages, MapPinned, ShieldCheck, Tag, Users } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { getVehicleRates, formatEuro } from '@/lib/pricing'
import { localizeInternalPath } from '@/lib/localized-path'
import { titleCase, titleSizeClass } from '@/lib/typography'
import type { Locale } from '@/lib/i18n'

type Quality = { title: string; text: string }

const qualityIcons = [MapPinned, ShieldCheck, Languages, Users, Tag]

function getQualities(value: unknown): Quality[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return []
    const title = 'title' in item ? item.title : undefined
    const text = 'text' in item ? item.text : undefined
    return typeof title === 'string' && typeof text === 'string' ? [{ title, text }] : []
  })
}

export async function CarRentSection({ locale }: { locale: Locale }) {
  const [t, rates] = await Promise.all([
    getTranslations({ locale, namespace: 'carRent' }),
    getVehicleRates(),
  ])
  const qualities = getQualities(t.raw('qualities'))

  const vehicles = [
    {
      key: '4x4',
      icon: Car,
      label: t('vehicle4x4'),
      text: t('vehicle4x4Text'),
      price: formatEuro(rates.fourByFourPerDay, locale),
      model: rates.fourByFourModel,
    },
    {
      key: 'minivan',
      icon: Bus,
      label: t('vehicleMinivan'),
      text: t('vehicleMinivanText'),
      price: formatEuro(rates.miniVanPerDay, locale),
      model: rates.miniVanModel,
    },
  ]

  return (
    <section
      id="car-rent"
      aria-labelledby="car-rent-title"
      className="bg-[#F8F6F1] py-16 md:py-24"
    >
      <div className="container-custom mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E0A01C]">
            {t('eyebrow')}
          </p>
          <h2
            id="car-rent-title"
            className={`mt-3 font-caflisch font-normal text-[#06245F] ${titleSizeClass('xl')}`}
          >
            {titleCase(t('title'), locale)}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">{t('intro')}</p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-start">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
              {t('qualitiesTitle')}
            </h3>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {qualities.map((quality, index) => {
                const Icon = qualityIcons[index % qualityIcons.length]
                return (
                  <li
                    key={quality.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#06245F]/5 text-[#06245F]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="mt-3 font-semibold text-slate-900">{quality.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{quality.text}</p>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
              {t('vehiclesTitle')}
            </h3>
            <div className="mt-5 space-y-4">
              {vehicles.map(({ key, icon: Icon, label, text, price, model }) => (
                <div
                  key={key}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E0A01C]/15 text-[#8a5f00]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{label}</p>
                      <p className="text-sm text-slate-600">{text}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-[#06245F]">
                    {t('perDay', { price })}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {t('indicativeModel', { model })}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">{t('rateNote')}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href={localizeInternalPath('/tour-ideas', locale)}
            className="inline-flex items-center gap-2 rounded-full bg-[#06245F] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a347f]"
          >
            {t('ctaCircuits')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={localizeInternalPath('/contact', locale)}
            className="inline-flex items-center rounded-full border border-[#06245F] px-7 py-3.5 text-sm font-semibold text-[#06245F] transition-colors hover:bg-[#06245F] hover:text-white"
          >
            {t('ctaQuote')}
          </Link>
        </div>
      </div>
    </section>
  )
}
