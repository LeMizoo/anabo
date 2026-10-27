import Image from 'next/image'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { sanityClient, getImageUrl } from '@/lib/sanity'
import { tourIdeasQuery } from '@/lib/queries'
import { locales, type Locale } from '@/lib/i18n'
import { notFound } from 'next/navigation'
import type { SanityImage } from '@/lib/types'

type Props = {
  params: Promise<{ locale: string }>
}

type TourIdea = {
  _id: string
  title: string
  slug: string
  pageType: string
  excerpt?: string
  featuredImage?: SanityImage
}

export default async function TourIdeasPage({ params }: Props) {
  const { locale: localeParam } = await params
  if (!locales.includes(localeParam as Locale)) notFound()

  const locale = localeParam as Locale
  setRequestLocale(locale)

  const t = await getTranslations('tourIdeas')

  const tours = await sanityClient.fetch<TourIdea[]>(tourIdeasQuery, { locale })

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white py-16 text-center">
        <h1 className="text-4xl font-serif text-[#06245F] md:text-5xl">{t('title')}</h1>
        <p className="mx-auto mt-6 max-w-3xl text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      <div className="container-custom mx-auto mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <Link
            key={tour._id}
            href={`/${locale}/${tour.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition hover:shadow-xl"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              {tour.featuredImage ? (
                <Image
                  src={getImageUrl(tour.featuredImage, 600, 80)}
                  alt={tour.featuredImage.alt || tour.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-200 text-gray-400">
                  {t('noImage')}
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h2 className="text-xl font-bold text-[#06245F]">{tour.title}</h2>
              {tour.excerpt && (
                <p className="mt-3 line-clamp-4 flex-1 text-sm text-gray-600">
                  {tour.excerpt}
                </p>
              )}
              <div className="mt-6">
                <span className="inline-flex rounded bg-[#E0A01C] px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-[#c98b13]">
                  {tour.pageType === 'custom-trip' ? t('createTrip') : t('details')}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}