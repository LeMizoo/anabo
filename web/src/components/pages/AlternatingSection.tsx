
'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { PortableText } from '@portabletext/react'
import { getImageUrl } from '@/lib/sanity'
import { subtitleSizeClass, titleSizeClass } from '@/lib/typography'
import type { AlternatingBlock } from '@/lib/types'

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
  globalHeadingFont?: string
  globalHeadingWeight?: string
}

export function AlternatingSection({
  block,
  globalHeadingFont,
  globalHeadingWeight,
}: Props) {
  const bgClass =
    block.backgroundColor === 'cream'
      ? 'bg-[#FDF8F5] dark:bg-gray-800'
      : 'bg-white dark:bg-gray-900'

  const imageFirst = block.imagePosition === 'left'

  const titleFont = block.titleFont || globalHeadingFont || 'font-serif'
  const titleWeight = block.titleWeight || globalHeadingWeight || 'font-bold'
  const subtitleFont = block.subtitleFont || 'font-script'

  return (
    <section className={`py-16 md:py-24 overflow-hidden ${bgClass}`}>
      <div className="container-custom mx-auto max-w-6xl px-4">
        <div
          className={`flex flex-col gap-12 md:flex-row md:items-center ${
            imageFirst ? 'md:flex-row-reverse' : ''
          }`}
        >
          {/* Bloc Texte */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-6"
          >
            {block.subtitle && (
              <span
                className={`${subtitleFont} ${subtitleSizeClass(block.subtitleSize)} block text-[#E0A01C] dark:text-[#E0A01C]`}
              >
                {block.subtitle}
              </span>
            )}

            <h2
              className={`${titleFont} ${titleWeight} ${titleSizeClass(block.titleSize)} uppercase tracking-wide text-[#06245F] dark:text-white`}
            >
              {block.title}
            </h2>

            {block.content && (
              <div className="prose max-w-none leading-relaxed text-gray-700 dark:text-gray-300">
                <PortableText value={block.content as never} />
              </div>
            )}
          </motion.div>

          {/* Bloc Image principale et images flottantes */}
          {block.image && (
            <motion.div
              initial={{ opacity: 0, x: imageFirst ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex flex-1 items-center justify-center py-8"
            >
              {/* Image principale */}
              <div className="relative z-0 aspect-[4/3] overflow-hidden rounded-xl shadow-lg" style={{ width: block.imageSize === 'sm' ? '65%' : block.imageSize === 'lg' ? '100%' : '85%' }}>
                <Image
                  src={getImageUrl(block.image, 800, 85)}
                  alt={block.image.alt || block.title || 'Illustration de la section'}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Images flottantes indépendantes */}
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
                    className={`pointer-events-none absolute z-10 ${sizeClass} ${positionClass} drop-shadow-2xl`}
                  >
                    <Image
                      src={floatUrl}
                      alt={floatImg.image.alt || 'Image superposée'}
                      width={400}
                      height={800}
                      className="h-auto w-full object-contain"
                    />
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
