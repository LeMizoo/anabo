import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { defaultLocale, locales } from '@/lib/i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

const CANONICAL_HOST = 'roadtrip.anabo.mg'

export default function middleware(request: NextRequest) {
  // Une seule adresse officielle : https://roadtrip.anabo.mg
  // (évite les doublons http / www pour Google et force le chiffrement).
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim()
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').split(':')[0].toLowerCase()
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')

  if (!isLocal && (proto === 'http' || host === `www.${CANONICAL_HOST}`)) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CANONICAL_HOST}`)
    return NextResponse.redirect(url, 301)
  }

  // L'administration et l'API ne passent pas par la gestion des langues.
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  return intlMiddleware(request)
}

export const config = {
  // Toutes les pages (y compris l'admin et l'API), sauf les fichiers statiques et internes.
  matcher: ['/((?!_next|.*\\..*).*)'],
}
