'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const navigation = [
  { key: 'home', href: '' },
  { key: 'madagascar', href: '/madagascar' },
  { key: 'tourIdeas', href: '/tour-ideas' },
  { key: 'tripGuidelines', href: '/trip-guidelines' },
  { key: 'aboutUs', href: '/about-us' },
  { key: 'contact', href: '/contact' },
]

const locales = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'it', label: 'IT' },
]

export function Header() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const [mobileOpen, setMobileOpen] = useState(false)

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
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container-custom">
        <div className="flex h-20 items-center justify-between">
          <Link
            href={getHref('')}
            className="flex items-center"
            onClick={() => setMobileOpen(false)}
          >
            <span className="font-display text-xl font-bold tracking-tight text-primary-700 sm:text-2xl">
              ANABO
            </span>
            <span className="ml-1 text-sm font-medium tracking-wide text-gray-500">
              ROADTRIP
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navigation.map((item) => {
              const href = getHref(item.href)
              const active =
                item.href === ''
                  ? pathname === href
                  : pathname.startsWith(href)

              return (
                <Link
                  key={item.key}
                  href={href}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    active
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600',
                  )}
                >
                  {t(item.key)}
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {locales.map((locale) => {
              const active = currentLocale === locale.code

              return (
                <Link
                  key={locale.code}
                  href={changeLocale(locale.code)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                    active
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  {locale.label}
                </Link>
              )
            })}
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t py-4 lg:hidden">
            <nav className="flex flex-col">
              {navigation.map((item) => {
                const href = getHref(item.href)
                const active =
                  item.href === ''
                    ? pathname === href
                    : pathname.startsWith(href)

                return (
                  <Link
                    key={item.key}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'rounded-lg px-3 py-3 text-sm font-medium',
                      active
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    {t(item.key)}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-4 flex gap-2 border-t pt-4">
              {locales.map((locale) => {
                const active = currentLocale === locale.code

                return (
                  <Link
                    key={locale.code}
                    href={changeLocale(locale.code)}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'rounded-full px-4 py-2 text-xs font-semibold',
                      active
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700',
                    )}
                  >
                    {locale.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
