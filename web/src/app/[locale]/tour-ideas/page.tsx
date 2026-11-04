import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight, MapPinned } from 'lucide-react'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { sanityClient, getImageUrl } from '@/lib/sanity'
import { tourIdeasQuery } from '@/lib/queries'
import { getRouteMapUrls, getTourRouteStops } from '@/lib/tour-routes'
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
  routeStops?: string[]
}

type SearchFaq = {
  question: string
  answer: string
}

function getSearchFaqs(value: unknown): SearchFaq[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return []

    const question = 'question' in item ? item.question : undefined
    const answer = 'answer' in item ? item.answer : undefined
    return typeof question === 'string' && typeof answer === 'string'
      ? [{ question, answer }]
      : []
  })
}

function getKeywords(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((keyword): keyword is string => typeof keyword === 'string')
    : []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params
  if (!locales.includes(localeParam as Locale)) return {}

  const t = await getTranslations({
    locale: localeParam,
    namespace: 'tourIdeas',
  })
  const title = t('metaTitle')
  const description = t('metaDescription')

  return {
    title,
    description,
    keywords: getKeywords(t.raw('keywords')),
    openGraph: { title, description },
  }
}

export default async function TourIdeasPage({ params }: Props) {
  const { locale: localeParam } = await params
  if (!locales.includes(localeParam as Locale)) notFound()

  const locale = localeParam as Locale
  setRequestLocale(locale)

  const t = await getTranslations('tourIdeas')
  const faqs = getSearchFaqs(t.raw('faqs'))
  const tours = await sanityClient.fetch<TourIdea[]>(tourIdeasQuery, { locale })
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-20">
      <header className="relative overflow-hidden bg-[#06245F] px-4 py-16 text-center text-white md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#28528D] via-[#06245F] to-[#04183E]" />
        <div className="relative mx-auto max-w-4xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
            <MapPinned size={16} aria-hidden="true" />
            ANABO ROADTRIP MADAGASCAR
          </span>
          <h1 className="font-script text-6xl font-semibold text-[#E0A01C] md:text-7xl">
            {t('title')}
          </h1>
          <p className="mx-auto mt-6 w-fit max-w-3xl rounded-md bg-white px-4 py-2 font-sans text-lg leading-7 text-[#06245F] md:text-xl">
            {t('subtitle')}
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
            {t('intro')}
          </p>
        </div>
      </header>

      <div className="container-custom mx-auto mt-10 grid gap-7 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
        {tours.map((tour) => {
          const stops = getTourRouteStops(tour)
          const routeUrls = stops ? getRouteMapUrls(stops) : null
          const featuredImageUrl = tour.featuredImage
            ? getImageUrl(tour.featuredImage, 900, 85)
            : null

          return (
            <article
              key={tour._id}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-18px_rgba(6,36,95,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-22px_rgba(6,36,95,0.4)]"
            >
              <Link href={`/${locale}/${tour.slug}`} className="flex flex-1 flex-col">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                  {featuredImageUrl ? (
                    <Image
                      src={featuredImageUrl}
                      alt={tour.featuredImage?.alt || tour.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500">
                      {t('noImage')}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04183E]/80 via-transparent to-black/10" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#06245F] shadow-sm">
                    {tour.pageType === 'custom-trip' ? t('createTrip') : t('details')}
                  </span>
                  <h2 className="absolute inset-x-5 bottom-5 font-serif text-2xl font-semibold leading-tight text-white drop-shadow md:text-3xl">
                    {tour.title}
                  </h2>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {tour.excerpt && (
                    <p className="line-clamp-3 text-sm leading-6 text-slate-600">{tour.excerpt}</p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#06245F]">
                    {tour.pageType === 'custom-trip' ? t('createTrip') : t('details')}
                    <ArrowUpRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>

              <div className="border-t border-slate-100 bg-slate-50/80 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <MapPinned size={15} aria-hidden="true" className="text-[#E0A01C]" />
                    {t('itinerary')}
                  </span>
                  {routeUrls && (
                    <a
                      href={routeUrls.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#06245F] hover:text-[#E0A01C]"
                    >
                      {t('viewRoute')}
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  )}
                </div>
                {routeUrls ? (
                  <div className="relative h-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
                    <iframe
                      title={`${t('itinerary')} — ${tour.title}`}
                      src={routeUrls.embedUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                    {t('routeNotConfigured')}
                  </p>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {faqs.length > 0 && (
        <section
          aria-labelledby="tour-ideas-faq-title"
          className="container-custom mx-auto mt-14 max-w-4xl"
        >
          <h2
            id="tour-ideas-faq-title"
            className="mb-6 font-script text-6xl font-bold text-[#E0A01C] md:text-7xl"
          >
            {t('faqTitle')}
          </h2>
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group py-4">
                <summary className="cursor-pointer pr-8 font-semibold text-gray-900">
                  {question}
                </summary>
                <p className="mt-3 leading-7 text-gray-700">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData).replace(/</g, '\\u003c'),
          }}
        />
      )}
    </div>
  )
}
