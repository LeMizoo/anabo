import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity'
import { siteSettingsQuery } from '@/lib/queries'
import type { SiteSettings } from '@/lib/types'

const navigation = [
  { key: 'home', href: '' },
  { key: 'madagascar', href: '/madagascar' },
  { key: 'tourIdeas', href: '/tour-ideas' },
  { key: 'tripGuidelines', href: '/trip-guidelines' },
  { key: 'aboutUs', href: '/about-us' },
  { key: 'contact', href: '/contact' },
]

export async function Footer() {
  const [settings, t, nav, locale] = await Promise.all([
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery),
    getTranslations('footer'),
    getTranslations('nav'),
    getLocale(),
  ])

  const localized = settings?.localized?.[locale as 'en' | 'fr' | 'it']
  const siteName =
    localized?.siteName ||
    settings?.siteName ||
    'ANABO ROADTRIP MADAGASCAR'
  const tagline = localized?.tagline || settings?.tagline
  const description = localized?.description || settings?.description

  return (
    <footer className="border-t bg-gray-950 text-white">
      <div className="container-custom py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link
              href={`/${locale}`}
              className="inline-flex items-baseline"
            >
              <span className="text-2xl font-bold tracking-tight text-white">
                ANABO
              </span>
              <span className="ml-1 text-sm font-medium tracking-wide text-gray-400">
                ROADTRIP
              </span>
            </Link>

            {tagline && (
              <p className="mt-4 max-w-md text-gray-400">
                {tagline}
              </p>
            )}

            {description && (
              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500">
                {description}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              {t('navigation')}
            </h2>

            <nav className="mt-4 flex flex-col gap-3">
              {navigation.map((item) => (
                <Link
                  key={item.key}
                  href={`/${locale}${item.href}`}
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  {nav(item.key)}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              {t('contact')}
            </h2>

            <div className="mt-4 space-y-4">
              {settings?.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="flex items-start gap-3 text-sm text-gray-400 hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{settings.contactEmail}</span>
                </a>
              )}

              {settings?.contactPhone && (
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="flex items-start gap-3 text-sm text-gray-400 hover:text-white"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{settings.contactPhone}</span>
                </a>
              )}

              {settings?.address && (
                <div className="flex items-start gap-3 text-sm text-gray-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{settings.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteName}
          </p>

          <p>{t('country')}</p>
        </div>
      </div>
    </footer>
  )
}
