import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server'
import { notFound } from 'next/navigation'
import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/layout/CookieBanner' // 👈 Import ajouté
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp'
import { locales, type Locale } from '@/lib/i18n'
import { sanityClient } from '@/lib/sanity'
import { siteSettingsQuery } from '@/lib/queries'
import type { SiteSettings } from '@/lib/types'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { fontVariables } from '@/lib/fonts'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

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
  const siteUrl = SITE_URL

  return {
    title: {
      template: `%s | ${SITE_NAME}`,
      default: SITE_NAME,
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
      siteName: SITE_NAME,
      locale,
      title: SITE_NAME,
      description: t('description'),
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
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

  const [messages, settings] = await Promise.all([
    getMessages(),
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery),
  ])

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {/* 👇 Le ThemeProvider englobe tout le contenu pour gérer le mode sombre 👇 */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* On ajoute les classes de fond et de texte de base + transition */}
            <div className="flex min-h-screen flex-col bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">
              <Header settings={settings} />
              <main className="flex-1">{children}</main>
              <Footer settings={settings} />
              <FloatingWhatsApp
                phone={settings?.whatsappNumber || settings?.contactPhone}
                enabled={settings?.showFloatingWhatsapp !== false}
                locale={locale}
              />
          
              {/* 👇 Bandeau de cookies ajouté ici 👇 */}
              <CookieBanner />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}