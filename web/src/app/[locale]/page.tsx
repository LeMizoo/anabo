import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { HomeHero } from '@/components/home/HomeHero'
import { sanityClient } from '@/lib/sanity'
import { homePageQuery } from '@/lib/queries'
import { locales, type Locale } from '@/lib/i18n'
import type { HomePage } from '@/lib/types'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale: localeParam } = await params

  if (!locales.includes(localeParam as Locale)) {
    notFound()
  }

  const locale = localeParam as Locale

  setRequestLocale(locale)

  const homePage = await sanityClient.fetch<HomePage | null>(
    homePageQuery,
  )

  const hero = homePage?.modules?.find(
    (module) => module._type === 'heroBlock',
  )

  if (!hero) {
    return (
      <section className="container-custom py-20">
        <h1 className="text-4xl font-bold">
          ANABO ROADTRIP MADAGASCAR
        </h1>
        <p className="mt-4 text-gray-600">
          Le contenu de la page d'accueil n'est pas encore configuré.
        </p>
      </section>
    )
  }

  return <HomeHero hero={hero} />
}
