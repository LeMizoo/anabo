import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity'
import { pageBySlugQuery, circuitsQuery } from '@/lib/queries'
import { locales, type Locale } from '@/lib/i18n'
import type { Page, Circuit } from '@/lib/types'
import { PageRenderer } from '@/components/pages/PageRenderer'

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

  return <PageRenderer modules={page.modules} circuits={circuits} />
}