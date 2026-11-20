import { locales } from '@/lib/i18n'

/**
 * URL canonique + versions linguistiques (hreflang) d'une page.
 * `path` commence par « / » (ex. « /tour-ideas »), ou vaut « » pour l'accueil.
 */
export function pageAlternates(locale: string, path: string) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((code) => [code, `/${code}${path}`])),
      'x-default': `/en${path}`,
    },
  }
}
