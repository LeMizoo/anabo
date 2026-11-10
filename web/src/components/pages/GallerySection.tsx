import Image from 'next/image'
import { getImageUrl } from '@/lib/sanity'
import { brandTextColor, titleCase, titleSizeClass } from '@/lib/typography'
import type { Locale } from '@/lib/i18n'
import type { GalleryBlock } from '@/lib/types'
import { ImageFrame, imageContentStyle } from './ImageFrame'
import { ImagePlaceholder } from './ImagePlaceholder'

type Props = {
  block: GalleryBlock
  locale: Locale
}

export function GallerySection({ block, locale }: Props) {
  const images = block.images ?? []

  return (
    <section className="container-custom">
      <div className="mx-auto max-w-6xl">
        {block.title && (
          <h2
            className={`mb-6 text-center text-[#06245F] ${block.titleFont || 'font-euphoria'} ${block.titleWeight || 'font-normal'} ${titleSizeClass(block.titleSize)}`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title, locale)}
          </h2>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.length > 0
            ? images.map((image, index) => {
                const imageUrl = getImageUrl(image, 900, 85)

                return (
                  <figure key={image._key || index} className="relative">
                    <ImageFrame
                      className="relative aspect-[4/3]"
                      presentation={image.presentation}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={image.alt || image.caption || ''}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          style={imageContentStyle(image.presentation)}
                        />
                      ) : (
                        <ImagePlaceholder locale={locale} />
                      )}
                    </ImageFrame>
                    {image.caption && (
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-8 text-sm text-white">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              })
            : Array.from({ length: 6 }, (_, index) => (
                <ImagePlaceholder
                  key={index}
                  locale={locale}
                  className="aspect-[4/3] rounded-xl"
                />
              ))}
        </div>
      </div>
    </section>
  )
}
