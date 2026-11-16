import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getImageUrl } from '@/lib/sanity'
import { brandTextColor, subtitleSizeClass, titleCase, titleSizeClass } from '@/lib/typography'
import { localizeInternalPath } from '@/lib/localized-path'
import type { Locale } from '@/lib/i18n'
import type { HeroBlock } from '@/lib/types'
import { ImageFrame, imageContentStyle } from './ImageFrame'
import { ImagePlaceholder } from './ImagePlaceholder'

type Props = {
  block: HeroBlock
  locale: Locale
}

export function HeroSection({ block, locale }: Props) {
  const alignment =
    block.alignment === 'left'
      ? 'items-start text-left'
      : block.alignment === 'right'
        ? 'items-end text-right'
        : 'items-center text-center'

  const imageUrl = block.backgroundImage
    ? getImageUrl(block.backgroundImage, 1920, 85)
    : null
  const imagePresentation = block.backgroundImage?.presentation || {
    border: 'none' as const,
    radius: 'none' as const,
    shadow: 'none' as const,
  }
  const titleFont = block.titleFont || 'font-caflisch'
  const subtitleFont = block.subtitleFont || 'font-sans'
  const heightClasses = {
    compact: 'min-h-[420px]',
    standard: 'min-h-[520px]',
    tall: 'min-h-[680px]',
    screen: 'min-h-screen',
  } as const
  const contentAnimationClasses = {
    none: '',
    'fade-in': 'hero-content-fade-in',
    'fade-up': 'hero-content-fade-up',
    'slide-left': 'hero-content-slide-left',
    'slide-right': 'hero-content-slide-right',
  } as const
  const imageMotionClasses = {
    none: '',
    'pan-left': 'hero-image-pan-left',
    'pan-right': 'hero-image-pan-right',
    'pan-up': 'hero-image-pan-up',
    'pan-down': 'hero-image-pan-down',
    'ken-burns': 'hero-image-ken-burns',
  } as const
  const heightClass = heightClasses[block.height || 'standard']
  const imageMotionClass = imageMotionClasses[block.backgroundImageMotion || 'none']
  const contentAnimationClass = contentAnimationClasses[block.contentAnimation || 'fade-up']
  const imageMotionDuration = block.backgroundImageMotionDuration || 20

  return (
    <section className={`relative ${heightClass} overflow-hidden bg-[#06245F]`}>
      {imageUrl ? (
        <ImageFrame
          className="absolute inset-0"
          presentation={imagePresentation}
        >
          <Image
            src={imageUrl}
            alt={block.backgroundImage?.alt || ''}
            fill
            priority
            sizes="100vw"
            className={imageMotionClass}
            style={{
              ...imageContentStyle(imagePresentation),
              animationDuration: imageMotionClass ? `${imageMotionDuration}s` : undefined,
              objectPosition:
                imagePresentation.position ||
                block.backgroundImagePosition ||
                'center',
              objectFit:
                imagePresentation.fit ||
                block.backgroundImageFit ||
                'cover',
            }}
          />
        </ImageFrame>
      ) : (
        <ImagePlaceholder locale={locale} variant="cover" className="absolute inset-0" />
      )}

      {block.overlay !== false && (
        <>
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: (block.overlayOpacity ?? 45) / 100 }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#06172e]/70 via-[#06172e]/25 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#06172e]/35 to-transparent" />
        </>
      )}

      <div className={`container-custom relative z-10 flex ${heightClass} flex-col justify-center py-20`}>
        <div className={`flex max-w-4xl flex-col ${alignment} ${contentAnimationClass}`}>
          {block.eyebrow && (
            <p className="mb-4 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#F4C566] md:text-sm">
              <span className="h-px w-9 bg-[#E0A01C]" aria-hidden="true" />
              {block.eyebrow}
            </p>
          )}
          <h1
            className={`${titleSizeClass(block.titleSize || 'xl')} ${titleFont} ${block.titleWeight || 'font-normal'} text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.32)]`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title, locale)}
          </h1>

          {block.subtitle && (
            <p
              className={`mt-5 max-w-2xl text-white/90 ${subtitleSizeClass(block.subtitleSize || 'lg')} ${subtitleFont} leading-relaxed [text-shadow:0_1px_12px_rgba(0,0,0,0.45)]`}
              style={{ color: brandTextColor(block.subtitleColor) }}
            >
              {titleCase(block.subtitle, locale)}
            </p>
          )}

          {(block.ctaPrimary?.label || block.ctaSecondary?.label) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {block.ctaPrimary?.label && block.ctaPrimary.link && (
                <Link
                  href={localizeInternalPath(block.ctaPrimary.link, locale)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E0A01C] px-7 py-3.5 font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#c9870a] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#06245F]"
                >
                  {block.ctaPrimary.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}

              {block.ctaSecondary?.label && block.ctaSecondary.link && (
                <Link
                  href={localizeInternalPath(block.ctaSecondary.link, locale)}
                  className="inline-flex items-center rounded-full border border-white/80 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#06245F] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#06245F]"
                >
                  {block.ctaSecondary.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
