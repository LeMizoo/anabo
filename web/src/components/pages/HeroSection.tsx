import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/sanity'
import { brandTextColor, subtitleSizeClass, titleCase, titleSizeClass } from '@/lib/typography'
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
  const titleFont = block.titleFont || 'font-euphoria'
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
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: (block.overlayOpacity ?? 45) / 100 }}
        />
      )}

      <div className={`container-custom relative z-10 flex ${heightClass} flex-col justify-center py-20`}>
        <div className={`flex max-w-4xl flex-col ${alignment} ${contentAnimationClass}`}>
          <h1
            className={`${titleSizeClass(block.titleSize)} ${titleFont} ${block.titleWeight || 'font-normal'} text-white`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title)}
          </h1>

          {block.subtitle && (
            <p
              className={`mt-5 max-w-2xl text-white/90 ${subtitleSizeClass(block.subtitleSize)} ${subtitleFont}`}
              style={{ color: brandTextColor(block.subtitleColor) }}
            >
              {titleCase(block.subtitle)}
            </p>
          )}

          {(block.ctaPrimary?.label || block.ctaSecondary?.label) && (
            <div className="mt-8 flex flex-wrap gap-4">
              {block.ctaPrimary?.label && block.ctaPrimary.link && (
                <Link
                  href={block.ctaPrimary.link}
                  className="rounded-lg bg-[#E0A01C] px-6 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  {block.ctaPrimary.label}
                </Link>
              )}

              {block.ctaSecondary?.label && block.ctaSecondary.link && (
                <Link
                  href={block.ctaSecondary.link}
                  className="rounded-lg border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-[#06245F]"
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
