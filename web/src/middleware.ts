import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { defaultLocale, locales } from '@/lib/i18n'
import { auth } from '@/lib/auth'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

const adminMiddleware = auth((req) => {
  const { nextUrl } = req
  const isLoginPage = nextUrl.pathname === '/admin/login'

  if (!isLoginPage && !req.auth) {
    const loginUrl = new URL('/admin/login', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  if (isLoginPage && req.auth) {
    return NextResponse.redirect(new URL('/admin/demandes', nextUrl.origin))
  }
  return NextResponse.next()
})

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/api')) return NextResponse.next()
  if (pathname.startsWith('/admin')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (adminMiddleware as any)(req, event)
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}