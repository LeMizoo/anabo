'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { SiteSettings } from '@/lib/types'
import { SITE_NAME } from '@/lib/site'

const navigation = [
  { key: 'madagascar', href: '/madagascar' },
  { key: 'tourIdeas', href: '/tour-ideas' },
  { key: 'gallery', href: '/gallery' },
  { key: 'tripGuidelines', href: '/trip-guidelines' },
  { key: 'aboutUs', href: '/about-us' },
  { key: 'contact', href: '/contact' },
]

const locales = [
  { code: 'en', label: 'EN', flagClass: 'fi fi-gb' }, 
  { code: 'fr', label: 'FR', flagClass: 'fi fi-fr' },
  { code: 'it', label: 'IT', flagClass: 'fi fi-it' },
]

export function Header({ settings }: { settings?: SiteSettings | null }) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const [mobileOpen, setMobileOpen] = useState(false)
  const header = settings?.header
  const logoUrl = settings?.logo?.asset?.url || '/images/logo.svg'
  const logoHeight = Math.min(100, Math.max(24, header?.logoHeight ?? 48))
  const logoOpacity = Math.min(100, Math.max(0, header?.logoOpacity ?? 100)) / 100
  const dimensions = settings?.logo?.asset?.metadata?.dimensions
  const logoRatio =
    dimensions?.width && dimensions.height
      ? dimensions.width / dimensions.height
      : 372 / 374
  const logoWidth = Math.min(280, Math.max(logoHeight, logoHeight * logoRatio))
  const showLogo = header?.showLogo !== false
  const showNavigation = header?.showNavigation !== false
  const showThemeToggle = header?.showThemeToggle !== false
  const showLanguageSwitcher = header?.showLanguageSwitcher !== false

  const currentLocale = pathname.split('/')[1] || 'en'

  const getHref = (path: string) => `/${currentLocale}${path}`

  const changeLocale = (locale: string) => {
    const segments = pathname.split('/')
    if (segments[1] && locales.some((item) => item.code === segments[1])) {
      segments[1] = locale
      return segments.join('/') || `/${locale}`
    }
    return `/${locale}${pathname === '/' ? '' : pathname}`
  }

  return (
    <header
      className={`${header?.sticky === false ? 'relative' : 'sticky top-0'} z-50 border-b bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95`}
    >
      <div className="container-custom">
        <div className="flex min-h-20 items-center justify-between gap-4 py-2">
          
          {/* Logo */}
          {showLogo && <Link
            href={getHref('')}
            className="flex items-center"
            onClick={() => setMobileOpen(false)}
            aria-label={SITE_NAME}
          >
            <Image
              src={logoUrl}
              alt={SITE_NAME}
              width={Math.round(logoWidth)}
              height={logoHeight}
              sizes={`${Math.round(logoWidth)}px`}
              className="w-auto max-w-[280px] object-contain"
              style={{ height: logoHeight, opacity: logoOpacity }}
              priority
            />
          </Link>}

          {/* Navigation Desktop */}
          {showNavigation && <nav className="hidden items-center gap-6 lg:flex">
            {navigation.map((item) => {
              const href = getHref(item.href)
              const active = pathname.startsWith(href)

              return (
                <Link
                  key={item.key}
                  href={href}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    active
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400',
                  )}
                >
                  {t(item.key)}
                </Link>
              )
            })}
          </nav>}

          {/* Actions Desktop : Theme + Langues */}
          {(showThemeToggle || showLanguageSwitcher) && <div className="hidden items-center gap-4 lg:flex">
            {/* 👇 Bouton Thème 👇 */}
            {showThemeToggle && <ThemeToggle />}

            {/* Langues */}
            {showLanguageSwitcher && <div className="flex items-center gap-2">
              {locales.map((locale) => {
                const active = currentLocale === locale.code

                return (
                  <Link
                    key={locale.code}
                    href={changeLocale(locale.code)}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                      active
                        ? 'bg-primary-600 text-white dark:bg-primary-500'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                    )}
                  >
                    <span className={cn(locale.flagClass, 'rounded-sm')} style={{ width: '18px', height: '13px', backgroundSize: 'cover' }}></span>
                    {locale.label}
                  </Link>
                )
              })}
            </div>}
          </div>}

          {/* Bouton Burger Mobile */}
          {(showNavigation || showThemeToggle || showLanguageSwitcher) && <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>}
        </div>

        {/* Menu Mobile */}
        {mobileOpen && (showNavigation || showThemeToggle || showLanguageSwitcher) && (
          <div className="border-t py-4 lg:hidden dark:border-gray-800">
            {showNavigation && <nav className="flex flex-col">
              {navigation.map((item) => {
                const href = getHref(item.href)
                const active = pathname.startsWith(href)

                return (
                  <Link
                    key={item.key}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'rounded-lg px-3 py-3 text-sm font-medium',
                      active
                        ? 'bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-primary-400'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800',
                    )}
                  >
                    {t(item.key)}
                  </Link>
                )
              })}
            </nav>}

            {/* Langues et Thème Mobile */}
            {(showLanguageSwitcher || showThemeToggle) && <div className="mt-4 flex items-center justify-between border-t pt-4 dark:border-gray-800">
              {showLanguageSwitcher && <div className="flex gap-2">
                {locales.map((locale) => {
                  const active = currentLocale === locale.code

                  return (
                    <Link
                      key={locale.code}
                      href={changeLocale(locale.code)}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold',
                        active
                          ? 'bg-primary-600 text-white dark:bg-primary-500'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                      )}
                    >
                      <span className={cn(locale.flagClass, 'rounded-sm')} style={{ width: '18px', height: '13px', backgroundSize: 'cover' }}></span>
                      {locale.label}
                    </Link>
                  )
                })}
              </div>}
              {showThemeToggle && <ThemeToggle />}
            </div>}
          </div>
        )}
      </div>
    </header>
  )
}