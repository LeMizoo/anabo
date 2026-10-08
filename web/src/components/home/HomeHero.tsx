import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { getImageUrl } from '@/lib/sanity'
import type { HeroBlock } from '@/lib/types'

type HomeHeroProps = {
  hero: HeroBlock
}

export async function HomeHero({ hero }: HomeHeroProps) {
  const t = await getTranslations('home')

  const backgroundImage = hero.backgroundImage?.asset?.url
    ? getImageUrl(hero.backgroundImage.asset.url, 1920, 85)
    : null

  const alignment =
    hero.alignment === 'left'
      ? 'items-start text-left'
      : hero.alignment === 'right'
        ? 'items-end text-right'
        : 'items-center text-center'

  return (
    <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-gray-900">
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt={hero.backgroundImage?.alt || ''}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
      )}

      <div
        className={`absolute inset-0 -z-10 ${
          hero.overlay === false ? 'bg-black/10' : 'bg-black/45'
        }`}
      />

      <div className="container-custom flex min-h-[calc(100vh-5rem)] items-center py-20">
        <div className={`flex w-full max-w-4xl flex-col ${alignment}`}>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            {t('eyebrow')}
          </p>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl">
            {hero.title || t('fallbackTitle')}
          </h1>

          {hero.subtitle && (
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">
              {hero.subtitle}
            </p>
          )}

          {(hero.ctaPrimary?.label || hero.ctaSecondary?.label) && (
            <div className="mt-9 flex flex-wrap gap-4">
              {hero.ctaPrimary?.label && hero.ctaPrimary.link && (
                <Link
                  href={hero.ctaPrimary.link}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                >
                  {hero.ctaPrimary.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {hero.ctaSecondary?.label && hero.ctaSecondary.link && (
                <Link
                  href={hero.ctaSecondary.link}
                  className="inline-flex items-center rounded-full border border-white/80 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-gray-900"
                >
                  {hero.ctaSecondary.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
