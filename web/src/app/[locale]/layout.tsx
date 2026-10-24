import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { locales, type Locale } from '@/lib/i18n'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// Les pages sont régénérées toutes les 5 minutes : le contenu Sanity
// (footer, coordonnées, etc.) se met à jour sans rebuild.
export const revalidate = 300

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale: localeParam } = await params

  if (!locales.includes(localeParam as Locale)) {
    return {}
  }

  const locale = localeParam as Locale

  setRequestLocale(locale)

  const t = await getTranslations('metadata')

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://anabo.mg'

  return {
    title: {
      template: '%s | ANABO ROADTRIP',
      default: t('title'),
    },
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        fr: '/fr',
        it: '/it',
      },
    },
    openGraph: {
      type: 'website',
      url: `${siteUrl}/${locale}`,
      siteName: 'ANABO ROADTRIP MADAGASCAR',
      locale,
      title: t('title'),
      description: t('description'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: localeParam } = await params

  if (!locales.includes(localeParam as Locale)) {
    notFound()
  }

  const locale = localeParam as Locale

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}