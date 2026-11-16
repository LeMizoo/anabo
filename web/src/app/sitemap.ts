import type { MetadataRoute } from 'next'
import { sanityClient } from '@/lib/sanity'
import { locales, type Locale } from '@/lib/i18n'

type SitemapPage = {
  _id: string
  _updatedAt?: string
  language?: Locale
  pageType?: string
  translationGroup?: string
  slug?: string
}

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://roadtrip.anabo.mg').replace(/\/+$/, '')
  const pages = await sanityClient.fetch<SitemapPage[]>(`
    *[_type == "page" && !(_id in path("drafts.**")) && language in $locales]{
      _id,
      _updatedAt,
      language,
      pageType,
      translationGroup,
      "slug": slug.current
    }
  `, { locales })

  const pagesByGroup = new Map<string, SitemapPage[]>()
  for (const page of pages) {
    const group = page.translationGroup || page._id
    const translations = pagesByGroup.get(group) || []
    translations.push(page)
    pagesByGroup.set(group, translations)
  }

  const entries: MetadataRoute.Sitemap = []
  for (const translations of pagesByGroup.values()) {
    const slug =
      translations.find((page) => page.language === 'en')?.slug ||
      translations.find((page) => page.language === 'fr')?.slug ||
      translations[0]?.slug
    if (!slug && !translations.some((page) => page.pageType === 'home')) continue

    const routeFor = (page: SitemapPage) =>
      page.pageType === 'home' ? `/${page.language}` : `/${page.language}/${slug}`

    const languages = Object.fromEntries(
      translations
        .filter((page): page is SitemapPage & { language: Locale } =>
          Boolean(page.language && (page.pageType === 'home' || slug)),
        )
        .map((page) => [page.language, `${baseUrl}${routeFor(page)}`]),
    )

    for (const page of translations) {
      if (!page.language || (!slug && page.pageType !== 'home')) continue
      entries.push({
        url: `${baseUrl}${routeFor(page)}`,
        lastModified: page._updatedAt ? new Date(page._updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: page.pageType === 'home' ? 1 : 0.7,
        alternates: { languages },
      })
    }
  }

  for (const locale of locales) {
    const url = `${baseUrl}/${locale}/politique-cookies`
    entries.push({
      url,
      changeFrequency: 'yearly',
      priority: 0.2,
      alternates: {
        languages: Object.fromEntries(
          locales.map((translatedLocale) => [
            translatedLocale,
            `${baseUrl}/${translatedLocale}/politique-cookies`,
          ]),
        ),
      },
    })
  }

  return entries
}
