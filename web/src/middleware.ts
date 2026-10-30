import createMiddleware from 'next-intl/middleware'
import { defaultLocale, locales } from '@/lib/i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export default intlMiddleware

export const config = {
  matcher: ['/((?!_next|.*\\..*|admin|api).*)'],
}