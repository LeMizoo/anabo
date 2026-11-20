import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { HomeHero } from '@/components/home/HomeHero'
import { JotformWidget } from '@/components/pages/JotformWidget'
import { PageRenderer } from '@/components/pages/PageRenderer'
import { sanityClient } from '@/lib/sanity'
import { circuitsQuery, homePageQuery } from '@/lib/queries'
import { locales, type Locale } from '@/lib/i18n'
import type { HomePage, HeroBlock, Circuit } from '@/lib/types'
import { titleCase, titleSizeClass } from '@/lib/typography'
import { SITE_NAME, SITE_URL } from '@/lib/site'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale: localeParam } = await params

  if (!locales.includes(localeParam as Locale)) {
    return {}
  }

  setRequestLocale(localeParam as Locale)

  const t = await getTranslations('metadata')

  return {
    title: { absolute: SITE_NAME },
    description: t('description'),
  }
}

export default async function HomePage({ params }: Props) {
  const { locale: localeParam } = await params

  if (!locales.includes(localeParam as Locale)) {
    notFound()
  }

  const locale = localeParam as Locale

  setRequestLocale(locale)

  const [homePage, circuits, t] = await Promise.all([
    sanityClient.fetch<HomePage | null>(
      homePageQuery,
      { locale },
    ),
    sanityClient.fetch<Circuit[]>(
      circuitsQuery,
      { locale },
    ),
    getTranslations('home'),
  ])

  const hero = homePage?.modules?.find(
    (module): module is HeroBlock => module._type === 'heroBlock',
  )

  const otherModules = (homePage?.modules ?? []).filter(
    (module) => module._type !== 'heroBlock',
  )

  const hasTripadvisorBlock = otherModules.some(
    (module) => module._type === 'tripadvisorBlock',
  )

  const siteUrl = SITE_URL
  const description = (await getTranslations('metadata'))('description')

  // Données structurées : l'agence et son chauffeur-guide Vonjy.
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${siteUrl}/#organization`,
    name: SITE_NAME,
    url: `${siteUrl}/${locale}`,
    description,
    areaServed: { '@type': 'Country', name: 'Madagascar' },
    knowsLanguage: ['mg', 'fr', 'en', 'it'],
    employee: {
      '@type': 'Person',
      name: 'Vonjy',
      jobTitle: t('vonjyJobTitle'),
      description: t('vonjyBadge'),
      worksFor: { '@id': `${siteUrl}/#organization` },
    },
  }

  if (!hero) {
    return (
      <section className="container-custom py-20">
        <h1 className={`font-bold ${titleSizeClass('xl')}`}>
          {titleCase(t('fallbackTitle'), locale)}
        </h1>
        <p className="mt-4 text-gray-600">
          {t('fallbackDescription')}
        </p>
      </section>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <HomeHero hero={hero} settings={hero.settings} locale={locale} />

      <PageRenderer
        modules={otherModules}
        circuits={circuits}
        locale={locale}
      />

      {!hasTripadvisorBlock && <JotformWidget />}
    </>
  )
}
