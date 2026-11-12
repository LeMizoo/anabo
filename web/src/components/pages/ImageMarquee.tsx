import Image from 'next/image'
import type { CSSProperties } from 'react'
import { getImageUrl } from '@/lib/sanity'
import { brandTextColor, titleCase, titleSizeClass } from '@/lib/typography'
import type { Locale } from '@/lib/i18n'
import type { ImageMarqueeBlock } from '@/lib/types'
import { ImageFrame, imageContentStyle } from './ImageFrame'

type Props = {
  block: ImageMarqueeBlock
  locale: Locale
}

const repeatCount = 10

export function ImageMarquee({ block, locale }: Props) {
  const images = (block.images ?? [])
    .flatMap((image) => {
      const url = getImageUrl(image, 900, 85)
      return url ? [{ image, url }] : []
    })

  if (images.length === 0) return null

  const duration = Math.min(120, Math.max(5, block.duration || 30))
  const trackStyle = { '--marquee-duration': `${duration}s` } as CSSProperties
  const imageWidth = images.length === 1 ? 'min(80vw, 60rem)' : undefined

  return (
    <section className="overflow-hidden">
      {block.title && (
        <h2
          className={`container-custom mb-6 text-center text-[#06245F] ${block.titleFont || 'font-caflisch'} ${block.titleWeight || 'font-normal'} ${titleSizeClass(block.titleSize)}`}
          style={{ color: brandTextColor(block.titleColor) }}
        >
          {titleCase(block.title, locale)}
        </h2>
      )}
      <div
        className="image-marquee"
        role="region"
        aria-label={titleCase(block.title || 'Galerie photos', locale)}
      >
        <div className="image-marquee__track" style={trackStyle}>
          {Array.from({ length: repeatCount }, (_, groupIndex) => (
            <div
              className="image-marquee__group"
              key={groupIndex}
              aria-hidden={groupIndex > 0}
            >
              {images.map(({ image, url }, imageIndex) => (
                <ImageFrame
                  key={`${image._key || imageIndex}-${groupIndex}`}
                  className="image-marquee__item"
                  presentation={image.presentation}
                  style={imageWidth ? { flexBasis: imageWidth } : undefined}
                >
                  <Image
                    src={url}
                    alt={groupIndex === 0 ? image.alt || '' : ''}
                    fill
                    sizes={images.length === 1 ? '80vw' : '(max-width: 640px) 75vw, 32vw'}
                    style={imageContentStyle(image.presentation)}
                  />
                </ImageFrame>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
