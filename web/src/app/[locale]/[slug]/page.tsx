import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity'
import { pageBySlugQuery, circuitsQuery } from '@/lib/queries'
import { locales, type Locale } from '@/lib/i18n'
import type { Page, Circuit } from '@/lib/types'
import { PageRenderer } from '@/components/pages/PageRenderer'
import { ImagePlaceholderGallery } from '@/components/pages/ImagePlaceholderGallery'
import { getTourRouteStops } from '@/lib/tour-routes'
import { titleCase, titleSizeClass } from '@/lib/typography'
import { MapPinned } from 'lucide-react'

type Props = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

async function getPage(slug: string, locale: Locale) {
  return sanityClient.fetch<Page | null>(
    pageBySlugQuery,
    { slug, locale },
    { cache: 'no-store' } // 👈 Ajout crucial pour ne pas perdre les mises à jour
  )
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale: localeParam, slug } = await params

  if (!locales.includes(localeParam as Locale)) {
    return {}
  }

  const locale = localeParam as Locale
  const page = await getPage(slug, locale)

  if (!page) {
    return {}
  }

  const seo = page.seo

  return {
    title: seo?.metaTitle || page.title,
    description: seo?.metaDescription || page.excerpt,
    keywords: seo?.keywords,
    alternates: seo?.canonicalUrl
      ? {
          canonical: seo.canonicalUrl,
        }
      : undefined,
    robots: seo?.noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      title: seo?.metaTitle || page.title,
      description: seo?.metaDescription || page.excerpt,
      url: seo?.canonicalUrl,
      images: seo?.ogImage
        ? [
            {
              url: seo.ogImage.asset?.url || '',
              alt: seo.ogImage.alt || page.title,
            },
          ]
        : undefined,
    },
  }
}

export default async function PageBySlug({ params }: Props) {
  const { locale: localeParam, slug } = await params

  if (!locales.includes(localeParam as Locale)) {
    notFound()
  }

  const locale = localeParam as Locale

  setRequestLocale(locale)

  const page = await getPage(slug, locale)

  if (!page) {
    notFound()
  }

  // Récupération des circuits pour le formulaire
  let circuits = await sanityClient.fetch<Circuit[]>(
    circuitsQuery,
    { locale },
    { cache: 'no-store' }
  )

  // 👇 SÉCURITÉ : Si aucun circuit n'est trouvé dans la langue actuelle (ex: EN ou IT),
  // on va chercher les circuits en FR pour que le menu s'affiche quand même.
  if (!circuits || circuits.length === 0) {
    circuits = await sanityClient.fetch<Circuit[]>(
      circuitsQuery,
      { locale: 'fr' },
      { cache: 'no-store' }
    )
  }

  const itineraryStops = page.pageType === 'circuit' || page.pageType === 'custom-trip'
    ? getTourRouteStops(page)
    : undefined
  const t = await getTranslations('tourIdeas')
  const hasHeroModule = page.modules?.some((module) => module._type === 'heroBlock')
  const hasGalleryImages = page.modules?.some(
    (module) =>
      module._type === 'galleryBlock' &&
      module.images?.some(
        (image) =>
          typeof image.asset?.url === 'string' ||
          typeof image.asset?._id === 'string' ||
          typeof image.asset?._ref === 'string',
      ),
  ) ?? false

  return (
    <>
      {itineraryStops && (
        <section className="container-custom py-10 md:py-14">
          <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            {hasHeroModule ? (
              <h2 className={`font-serif font-semibold text-[#06245F] ${titleSizeClass('lg')}`}>
                {titleCase(page.title, locale)}
              </h2>
            ) : (
              <h1 className={`font-serif font-semibold text-[#06245F] ${titleSizeClass('lg')}`}>
                {titleCase(page.title, locale)}
              </h1>
            )}
            <p className="mt-3 text-sm leading-6 text-slate-600">{t('suggestedRoute')}</p>
            <div className="mt-6 flex items-start gap-3">
              <MapPinned className="mt-1 h-5 w-5 shrink-0 text-[#E0A01C]" aria-hidden="true" />
              <ol className="flex flex-wrap gap-2" aria-label={t('itinerary')}>
                {itineraryStops.map((stop, index) => (
                  <li
                    key={`${stop}-${index}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                  >
                    {stop.replace(/, Madagascar$/, '')}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}
      <PageRenderer modules={page.modules} circuits={circuits} />
      {slug === 'gallery' && !hasGalleryImages && (
        <ImagePlaceholderGallery locale={locale} />
      )}
    </>
  )
}