import Image from 'next/image'
import { getImageUrl } from '@/lib/sanity'
import type { ImageBlock as ImageBlockType } from '@/lib/types'
import { ImageFrame, imageContentStyle } from './ImageFrame'

type Props = {
  block: ImageBlockType
}

export function ImageBlockSection({ block }: Props) {
  const image = block.image
  if (!image) return null
  const imageUrl = getImageUrl(image)
  if (!imageUrl) return null

  const { width, height } = image.asset?.metadata?.dimensions ?? {}
  const aspectRatios = {
    square: '1 / 1',
    landscape: '16 / 9',
    portrait: '3 / 4',
  } as const
  const fit = image.presentation?.fit || 'cover'
  const cropRatio =
    fit === 'cover' && block.crop && block.crop !== 'original'
      ? aspectRatios[block.crop]
      : undefined
  const aspectRatio = cropRatio || (width && height ? `${width} / ${height}` : '4 / 3')
  const scale = Number(block.scale || '100')

  return (
    <section className="container-custom">
      <div className="mx-auto max-w-6xl" style={{ width: `${scale}%` }}>
        <ImageFrame
          className="relative mx-auto w-full"
          presentation={image.presentation}
          style={{ aspectRatio }}
        >
          <Image
            src={imageUrl}
            alt={image.alt || ''}
            fill
            sizes="(max-width: 1280px) 100vw, 1152px"
            style={imageContentStyle(image.presentation)}
          />
        </ImageFrame>
      </div>
    </section>
  )
}
