
'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { PortableText } from '@portabletext/react'
import { getImageUrl } from '@/lib/sanity'
import { brandTextColor, subtitleSizeClass, titleCase, titleSizeClass } from '@/lib/typography'
import type { Locale } from '@/lib/i18n'
import type { AlternatingBlock } from '@/lib/types'
import { ImageFrame, imageContentStyle } from './ImageFrame'
import { ImagePlaceholder } from './ImagePlaceholder'

// Tailles des images flottantes
const SIZE_CLASSES = {
  sm: 'w-24 md:w-32',
  md: 'w-32 md:w-48',
  lg: 'w-40 md:w-56',
}

// Positions indépendantes sur l'image principale
const POSITION_CLASSES = {
  'top-left': 'top-0 -left-4 md:-left-10',
  'top-right': 'top-0 -right-4 md:-right-10',
  'center-left': 'top-1/2 -left-4 md:-left-10 -translate-y-1/2',
  'center-right': 'top-1/2 -right-4 md:-right-10 -translate-y-1/2',
  'bottom-left': 'bottom-0 -left-4 md:-left-10',
  'bottom-right': 'bottom-0 -right-4 md:-right-10',
}

type Props = {
  block: AlternatingBlock
  locale: Locale
  globalHeadingFont?: string
  globalHeadingWeight?: string
}

export function AlternatingSection({
  block,
  locale,
  globalHeadingFont,
  globalHeadingWeight,
}: Props) {
  const bgClass =
    block.backgroundColor === 'cream'
      ? 'bg-[#FDF8F5] dark:bg-gray-800'
      : 'bg-white dark:bg-gray-900'

  const imageFirst = block.imagePosition === 'left'
  const imageUrl = block.image ? getImageUrl(block.image, 800, 85) : null
  const contentAlignment = {
    top: 'md:items-start',
    center: 'md:items-center',
    bottom: 'md:items-end',
  }[block.contentVerticalAlignment || 'center']

  const titleFont = block.titleFont || globalHeadingFont || 'font-caflisch'
  const titleWeight = block.titleWeight || globalHeadingWeight || 'font-normal'
  const subtitleFont = block.subtitleFont || 'font-script'

  return (
    <section className={`overflow-hidden ${bgClass}`}>
      <div className="container-custom mx-auto max-w-6xl px-4">
        <div
          className={`flex flex-col gap-8 md:flex-row ${contentAlignment} ${
            imageFirst ? 'md:flex-row-reverse' : ''
          }`}
        >
          {/* Bloc Texte */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-5"
          >
            {block.subtitle && (
              <span
                className={`${subtitleFont} ${subtitleSizeClass(block.subtitleSize)} block text-[#E0A01C] dark:text-[#E0A01C]`}
                style={{ color: brandTextColor(block.subtitleColor) }}
              >
                {block.subtitle && titleCase(block.subtitle, locale)}
              </span>
            )}

            <h2
              className={`${titleFont} ${titleWeight} ${titleSizeClass(block.titleSize)} text-[#06245F] dark:text-white`}
              style={{ color: brandTextColor(block.titleColor) }}
            >
              {block.title && titleCase(block.title, locale)}
            </h2>

            {block.content && (
              <div className="prose max-w-none leading-relaxed text-gray-700 dark:text-gray-300">
                <PortableText value={block.content as never} />
              </div>
            )}
          </motion.div>

          {/* Bloc d’images */}
          <motion.div
            initial={{ opacity: 0, x: imageFirst ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex flex-1 items-center justify-center py-8"
          >
            {block.images?.length ? (
              <div
                className={`grid w-full gap-3 ${
                  block.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                }`}
                style={{
                  maxWidth:
                    block.imageSize === 'sm'
                      ? '65%'
                      : block.imageSize === 'md'
                        ? '85%'
                        : '100%',
                }}
              >
                {block.images.map((image, index) => {
                  const src = getImageUrl(image, 800, 85)

                  return (
                    <ImageFrame
                      key={image._key || index}
                      className="relative aspect-[4/3] w-full"
                      presentation={image.presentation}
                    >
                      {src ? (
                        <Image
                          src={src}
                          alt={image.alt || block.title || 'Illustration de la section'}
                          fill
                          className="transition-transform duration-700 hover:scale-105"
                          style={imageContentStyle(image.presentation)}
                        />
                      ) : (
                        <ImagePlaceholder locale={locale} />
                      )}
                    </ImageFrame>
                  )
                })}
              </div>
            ) : (
              <>
                <ImageFrame
                  className="relative z-0 aspect-[4/3]"
                  presentation={block.image?.presentation}
                  style={{ width: block.imageSize === 'sm' ? '65%' : block.imageSize === 'lg' ? '100%' : '85%' }}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={block.image?.alt || block.title || 'Illustration de la section'}
                      fill
                      className="transition-transform duration-700 hover:scale-105"
                      style={imageContentStyle(block.image?.presentation)}
                    />
                  ) : (
                    <ImagePlaceholder locale={locale} />
                  )}
                </ImageFrame>
                {block.floatingImages?.map((floatImg, index) => {
                  const floatUrl = getImageUrl(floatImg.image, 400, 85)
                  const sizeClass =
                    SIZE_CLASSES[floatImg.size] || SIZE_CLASSES.md
                  const positionClass =
                    POSITION_CLASSES[floatImg.position] ||
                    POSITION_CLASSES['center-right']

                  return (
                    <motion.div
                      key={floatImg._key || index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: 0.4 + index * 0.1,
                      }}
                      className={`pointer-events-none absolute z-10 ${sizeClass} ${positionClass}`}
                    >
                      <ImageFrame
                        className="relative aspect-[1/2] w-full"
                        presentation={floatImg.image.presentation}
                      >
                        {floatUrl ? (
                          <Image
                            src={floatUrl}
                            alt={floatImg.image.alt || 'Image superposée'}
                            fill
                            className="h-auto w-full"
                            style={imageContentStyle({
                              ...floatImg.image.presentation,
                              fit: floatImg.image.presentation?.fit || 'contain',
                            })}
                          />
                        ) : (
                          <ImagePlaceholder locale={locale} />
                        )}
                      </ImageFrame>
                    </motion.div>
                  )
                })}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
