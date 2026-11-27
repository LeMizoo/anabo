'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { SiteSettings } from '@/lib/types'
import { SITE_NAME } from '@/lib/site'

const navigation = [
  { key: 'madagascar', href: '/madagascar' },
  { key: 'tourIdeas', href: '/tour-ideas' },
  { key: 'tripGuidelines', href: '/trip-guidelines' },
  { key: 'aboutUs', href: '/about-us' },
  { key: 'contact', href: '/contact' },
]

const locales = [
  { code: 'en', label: 'EN', name: 'English', flagClass: 'fi fi-gb' },
  { code: 'fr', label: 'FR', name: 'Français', flagClass: 'fi fi-fr' },
  { code: 'it', label: 'IT', name: 'Italiano', flagClass: 'fi fi-it' },
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

  // Ferme le menu mobile au changement de page et bloque le défilement quand il est ouvert.
  useEffect(() => setMobileOpen(false), [pathname])
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMobileOpen(false)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  const languageSwitcher = showLanguageSwitcher && (
    <nav aria-label="Langue / Language" className="flex items-center gap-1 sm:gap-1.5">
      {locales.map((locale) => {
        const active = currentLocale === locale.code
        return (
          <Link
            key={locale.code}
            href={changeLocale(locale.code)}
            hrefLang={locale.code}
            lang={locale.code}
            aria-label={locale.name}
            aria-current={active ? 'true' : undefined}
            title={locale.name}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-1.5 py-1 text-xs font-semibold transition-all duration-200 sm:px-2.5',
              active
                ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-600/20 dark:bg-primary-500'
                : 'text-gray-600 hover:-translate-y-0.5 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(locale.flagClass, 'rounded-[3px] shadow-sm')}
              style={{ width: '20px', height: '14px', backgroundSize: 'cover' }}
            />
            <span className="hidden sm:inline">{locale.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <header
      className={`${header?.sticky === false ? 'relative' : 'sticky top-0'} z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90`}
    >
      <div className="container-custom">
        <div className="flex min-h-16 items-center justify-between gap-3 py-2 sm:min-h-20">
          {/* Logo + langues : toujours visibles, sur tous les écrans */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            {showLogo && (
              <Link
                href={getHref('')}
                className="flex shrink-0 items-center transition-opacity hover:opacity-80"
                aria-label={SITE_NAME}
              >
                <Image
                  src={logoUrl}
                  alt={SITE_NAME}
                  width={Math.round(logoWidth)}
                  height={logoHeight}
                  sizes={`${Math.round(logoWidth)}px`}
                  className="h-[min(var(--logo-h),44px)] w-auto max-w-[180px] object-contain sm:h-[var(--logo-h)] sm:max-w-[280px]"
                  style={{ ['--logo-h' as string]: `${logoHeight}px`, opacity: logoOpacity }}
                  priority
                />
              </Link>
            )}
            {languageSwitcher}
          </div>

          {/* Navigation (grand écran) */}
          {showNavigation && (
            <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
              {navigation.map((item) => {
                const href = getHref(item.href)
                const active = pathname.startsWith(href)
                return (
                  <Link
                    key={item.key}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400',
                    )}
                  >
                    {t(item.key)}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-[#E0A01C] transition-transform duration-300',
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                      )}
                    />
                  </Link>
                )
              })}
            </nav>
          )}

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {showThemeToggle && (
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
            )}
            {(showNavigation || showThemeToggle) && (
              <button
                type="button"
                aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((open) => !open)}
                className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 lg:hidden dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Menu mobile */}
        {mobileOpen && (showNavigation || showThemeToggle) && (
          <div id="mobile-menu" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-gray-100 py-3 lg:hidden dark:border-gray-800">
            {showNavigation && (
              <nav className="flex flex-col gap-1">
                {navigation.map((item) => {
                  const href = getHref(item.href)
                  const active = pathname.startsWith(href)
                  return (
                    <Link
                      key={item.key}
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'rounded-xl px-4 py-3 text-base font-medium transition-colors',
                        active
                          ? 'bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-primary-400'
                          : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                      )}
                    >
                      {t(item.key)}
                    </Link>
                  )
                })}
              </nav>
            )}
            {showThemeToggle && (
              <div className="mt-3 flex items-center justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
                <ThemeToggle />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
