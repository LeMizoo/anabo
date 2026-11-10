import { locales, type Locale } from './i18n'

export function localizeInternalPath(path: string, locale: Locale): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path

  const suffixIndex = path.search(/[?#]/u)
  const pathname = suffixIndex === -1 ? path : path.slice(0, suffixIndex)
  const suffix = suffixIndex === -1 ? '' : path.slice(suffixIndex)

  if (pathname === '/') return `/${locale}${suffix}`

  const segments = pathname.split('/')
  if (locales.includes(segments[1] as Locale)) {
    segments[1] = locale
  } else {
    segments.splice(1, 0, locale)
  }

  return `${segments.join('/')}${suffix}`
}
