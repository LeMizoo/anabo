import Image from 'next/image'
import { getImageUrl } from '@/lib/sanity'
import { titleSizeClass } from '@/lib/typography'
import type { GalleryBlock } from '@/lib/types'
import { ImageFrame, imageContentStyle } from './ImageFrame'

type Props = {
  block: GalleryBlock
}

export function GallerySection({ block }: Props) {
  const images = block.images?.filter((image) => image.asset?.url) ?? []

  if (images.length === 0) return null

  return (
    <section className="container-custom">
      <div className="mx-auto max-w-6xl">
        {block.title && (
          <h2
            className={`mb-8 text-center font-bold text-[#06245F] ${block.titleFont || 'font-serif'} ${titleSizeClass(block.titleSize)}`}
          >
            {block.title}
          </h2>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <figure key={image._key || index} className="relative">
              <ImageFrame
                className="relative aspect-[4/3]"
                presentation={image.presentation}
              >
                <Image
                  src={getImageUrl(image, 900, 85)}
                  alt={image.alt || image.caption || ''}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={imageContentStyle(image.presentation)}
                />
              </ImageFrame>
              {image.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-8 text-sm text-white">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
