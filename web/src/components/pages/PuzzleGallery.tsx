'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { getImageUrl } from '@/lib/sanity'
import { brandTextColor, titleCase, titleSizeClass } from '@/lib/typography'
import type { Locale } from '@/lib/i18n'
import type { PuzzleGalleryBlock, PuzzleItem } from '@/lib/types'
import { ImageFrame, imageContentStyle } from './ImageFrame'
import { ImagePlaceholder } from './ImagePlaceholder'

type Props = {
  block: PuzzleGalleryBlock
  locale: Locale
}

const automaticSizes: PuzzleItem['size'][] = [
  'wide',
  'small',
  'tall',
  'small',
  'large',
  'wide',
  'small',
  'tall',
]

const pixelWidths: Record<NonNullable<PuzzleItem['pixelation']>, number> = {
  none: 800,
  low: 48,
  medium: 24,
  high: 12,
}

const overlayClasses: Record<NonNullable<PuzzleItem['overlay']>, string> = {
  none: '',
  dark: 'bg-black/30',
  light: 'bg-white/30',
  accent: 'bg-[#e0a01c]/30',
}

export function PuzzleGallery({ block, locale }: Props) {
  const items: PuzzleItem[] = block.items?.length
    ? block.items
    : automaticSizes.slice(0, 6).map((size, index) => ({
        _key: `placeholder-${index}`,
        size,
      }))

  const getItemClasses = (size: NonNullable<PuzzleItem['size']>) => {
    switch (size) {
      case 'wide': return 'col-span-2 row-span-1 aspect-[2/1]'
      case 'tall': return 'col-span-1 row-span-2 aspect-[1/2]'
      case 'large': return 'col-span-2 row-span-2 aspect-square'
      default: return 'col-span-1 row-span-1 aspect-square'
    }
  }

  return (
    <section className="bg-white overflow-hidden">
      <div className="container-custom max-w-6xl mx-auto px-4">
        {block.title && (
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-center text-[#06245F] mb-6 ${block.titleFont || 'font-caflisch'} ${block.titleWeight || 'font-normal'} ${titleSizeClass(block.titleSize)}`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title, locale)}
          </motion.h2>
        )}

        <div className="grid grid-flow-dense grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-[150px] md:auto-rows-[200px]">
          {items.map((item, index) => {
            const imageUrl = getImageUrl(
              item.image,
              pixelWidths[item.pixelation || 'none'],
              80,
            )
            return (
              <motion.div
                key={item._key}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  x: item.overlap?.endsWith('left') ? -16 : item.overlap?.endsWith('right') ? 16 : 0,
                  y: item.overlap?.startsWith('top') ? -16 : item.overlap?.startsWith('bottom') ? 16 : 0,
                  zIndex: item.overlap && item.overlap !== 'none' ? 1 : undefined,
                }}
                className={`relative group ${getItemClasses(
                  block.layout === 'manual'
                    ? item.size || 'small'
                    : automaticSizes[index % automaticSizes.length] || 'small',
                )}`}
              >
                <div className="absolute inset-0">
                  {imageUrl && item.image ? (
                    <ImageFrame
                      className="h-full w-full"
                      presentation={item.image.presentation}
                    >
                      <Image
                        src={imageUrl}
                        alt={item.image.alt || item.caption || 'Galerie'}
                        fill
                        unoptimized={Boolean(item.pixelation && item.pixelation !== 'none')}
                        className="transition-transform duration-700 ease-in-out group-hover:scale-110"
                        style={{
                          ...imageContentStyle(item.image.presentation),
                          imageRendering: item.pixelation && item.pixelation !== 'none' ? 'pixelated' : undefined,
                        }}
                      />
                    </ImageFrame>
                  ) : (
                    <ImagePlaceholder locale={locale} />
                  )}
                </div>
                {item.overlay && item.overlay !== 'none' && (
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 rounded-xl ${overlayClasses[item.overlay]}`}
                  />
                )}
                <div className="absolute inset-0 flex items-end rounded-xl bg-black/40 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {item.caption && (
                    <p className="text-white font-medium text-sm md:text-base translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {item.caption}
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}