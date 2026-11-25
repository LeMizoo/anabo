import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from '@/lib/i18n'
import { MADAGASCAR_TIME_ZONE } from '@/lib/datetime'

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = (await requestLocale) || defaultLocale

  const resolvedLocale = locales.includes(
    requestedLocale as (typeof locales)[number],
  )
    ? requestedLocale
    : defaultLocale

  return {
    locale: resolvedLocale,
    // Fuseau fixe : sinon next-intl prend celui du serveur d'hébergement (variable).
    timeZone: MADAGASCAR_TIME_ZONE,
    messages: (
      await import(`../../messages/${resolvedLocale}.json`)
    ).default,
  }
})
