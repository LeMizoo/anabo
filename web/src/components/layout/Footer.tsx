import Link from 'next/link'
import { Facebook, Instagram, Mail, MapPin, Music2, Phone, Youtube } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import type { SiteSettings } from '@/lib/types'

const navigation = [
  { key: 'home', href: '' },
  { key: 'madagascar', href: '/madagascar' },
  { key: 'tourIdeas', href: '/tour-ideas' },
  { key: 'tripGuidelines', href: '/trip-guidelines' },
  { key: 'aboutUs', href: '/about-us' },
  { key: 'contact', href: '/contact' },
]

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
}

export async function Footer({ settings }: { settings?: SiteSettings | null }) {
  const [t, nav, locale] = await Promise.all([
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

  // 👇 Récupération des polices globales 👇
  const headingFont = settings?.typography?.globalHeadingFont || 'font-serif'
  const headingWeight = settings?.typography?.globalHeadingWeight || 'font-bold'
  const bodyFont = settings?.typography?.globalBodyFont || 'font-sans'
  const footer = settings?.footer

  return (
    // 👇 Application de la police du corps au footer 👇
    <footer className={`border-t bg-gray-950 text-white ${bodyFont}`}>
      <div className="container-custom py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Slogan et description */}
          {((footer?.showTagline !== false && tagline) ||
            (footer?.showDescription !== false && description)) && <div className="lg:col-span-2 space-y-4">
            {footer?.showTagline !== false && tagline && (
              <p className="max-w-md text-gray-400">
                {tagline}
              </p>
            )}

            {footer?.showDescription !== false && description && (
              <p className="max-w-xl text-sm leading-7 text-gray-500">
                {description}
              </p>
            )}
          </div>}

          {/* Liens de navigation */}
          {footer?.showNavigation !== false && <div>
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${headingFont} ${headingWeight}`}>
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
          </div>}

          {/* Contact */}
          {footer?.showContact !== false && <div>
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${headingFont} ${headingWeight}`}>
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
          </div>}
        </div>

        {footer?.showSocialLinks !== false && settings?.socialLinks?.length ? (
          <nav aria-label="Réseaux sociaux" className="mt-8 flex flex-wrap gap-3">
            {settings.socialLinks.map((social, index) => {
              if (!social.platform || !social.url) return null
              const Icon = socialIcons[social.platform as keyof typeof socialIcons]
              if (!Icon) return null

              return (
                <a
                  key={`${social.platform}-${index}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-gray-300 transition hover:border-white/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              )
            })}
          </nav>
        ) : null}

        {/* Copyright */}
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