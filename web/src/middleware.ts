import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import { defaultLocale, locales } from '@/lib/i18n'
import { auth } from '@/lib/auth'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export default auth((req) => {
  const { nextUrl } = req
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isLoginPage = nextUrl.pathname === '/admin/login'

  // 1. Protection des routes admin
  if (isAdminRoute && !isLoginPage) {
    if (!req.auth) {
      const loginUrl = new URL('/admin/login', nextUrl.origin)
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 2. Si connecté et sur la page login, rediriger vers le dashboard
  if (isLoginPage && req.auth) {
    return NextResponse.redirect(new URL('/admin/demandes', nextUrl.origin))
  }

  // 3. Laisser passer les routes API et admin (déjà gérées ci-dessus)
  if (isAdminRoute || nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // 4. Laisser next-intl gérer le multilingue pour le reste
  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}