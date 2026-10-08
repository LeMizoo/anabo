import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from '@/lib/i18n'

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = (await requestLocale) || defaultLocale

  const resolvedLocale = locales.includes(
    requestedLocale as (typeof locales)[number],
  )
    ? requestedLocale
    : defaultLocale

  return {
    locale: resolvedLocale,
    messages: (
      await import(`../../messages/${resolvedLocale}.json`)
    ).default,
  }
})
