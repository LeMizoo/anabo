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

  // Versions linguistiques existantes de cette page (même slug) → balises hreflang.
  const availableLocales = await sanityClient.fetch<string[]>(
    `*[_type == "page" && slug.current == $slug && !(_id in path("drafts.**"))].language`,
    { slug },
  )
  const languages = Object.fromEntries(
    locales
      .filter((code) => availableLocales.includes(code))
      .map((code) => [code, `/${code}/${slug}`]),
  )

  return {
    title: seo?.metaTitle || page.title,
    description: seo?.metaDescription || page.excerpt,
    keywords: seo?.keywords,
    alternates: {
      canonical: seo?.canonicalUrl || `/${locale}/${slug}`,
      languages: { ...languages, ...(languages.en ? { 'x-default': languages.en } : {}) },
    },
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
  const heroModule = page.modules?.find(
    (module) => module._type === 'heroBlock' && !module.settings?.hidden,
  )
  const remainingModules = heroModule
    ? page.modules?.filter(
        (module) =>
          module !== heroModule &&
          !(
            module._type === 'headingBlock' &&
            module.title?.trim().toLowerCase() === page.title.trim().toLowerCase()
          ),
      )
    : page.modules
  // Données structurées FAQPage : toutes les questions des blocs FAQ visibles de la page.
  const faqEntities = (page.modules ?? [])
    .flatMap((module) => (module._type === 'faqBlock' && !module.settings?.hidden ? module.items ?? [] : []))
    .filter((item) => item.question && Array.isArray(item.answer))
    .map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: (item.answer as { children?: { text?: string }[] }[])
          .map((block) => (block.children ?? []).map((child) => child.text ?? '').join(''))
          .join('\n'),
      },
    }))
  const hasGalleryBlock = page.modules?.some(
    (module) =>
      module._type === 'galleryBlock' || module._type === 'puzzleGalleryBlock',
  ) ?? false

  return (
    <>
      {heroModule && (
        <PageRenderer modules={[heroModule]} circuits={circuits} locale={locale} />
      )}
      {itineraryStops && (
        <section className="container-custom py-10 md:py-14">
          <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            {!heroModule && (
              <h1 className={`font-caflisch font-normal text-[#06245F] ${titleSizeClass('lg')}`}>
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
      <PageRenderer modules={remainingModules} circuits={circuits} locale={locale} sectionLinks={slug !== 'home'} />
      {faqEntities.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqEntities }).replace(/</g, '\\u003c'),
          }}
        />
      )}
      {slug === 'gallery' && !hasGalleryBlock && (
        <ImagePlaceholderGallery locale={locale} />
      )}
    </>
  )
}
