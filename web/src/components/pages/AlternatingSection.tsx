'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { PortableText } from '@portabletext/react'
import { getImageUrl } from '@/lib/sanity'
import type { SanityImage } from '@/lib/types'

type Props = {
  block: {
    title: string
    subtitle?: string
    subtitleFont?: string
    titleFont?: string
    titleWeight?: string
    subtitleWeight?: string
    content?: any[]
    image?: SanityImage
    imagePosition?: 'left' | 'right'
    backgroundColor?: 'white' | 'cream'
  }
  globalHeadingFont?: string
  globalHeadingWeight?: string
}

export function AlternatingSection({ block, globalHeadingFont, globalHeadingWeight }: Props) {
  // 👇 Ajout des classes dark pour le fond beige/blanc 👇
  const bgClass = block.backgroundColor === 'cream' 
    ? 'bg-[#FDF8F5] dark:bg-gray-800' 
    : 'bg-white dark:bg-gray-900'

  const imageFirst = block.imagePosition === 'left'

  // 👇 Logique de priorité : local > global > défaut 👇
  const titleFont = block.titleFont || globalHeadingFont || 'font-serif'
  const titleWeight = block.titleWeight || globalHeadingWeight || 'font-bold'
  const subtitleFont = block.subtitleFont || 'font-script'

  return (
    <section className={`py-16 md:py-24 overflow-hidden ${bgClass}`}>
      <div className="container-custom mx-auto max-w-6xl px-4">
        <div className={`flex flex-col gap-12 md:flex-row md:items-center ${imageFirst ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Bloc Texte */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-6"
          >
            {block.subtitle && (
              <span className={`${subtitleFont} text-[#E0A01C] dark:text-[#E0A01C] text-2xl md:text-3xl block`}>
                {block.subtitle}
              </span>
            )}
            <h2 className={`${titleFont} ${titleWeight} text-2xl uppercase tracking-wide text-[#06245F] dark:text-white md:text-3xl`}>
              {block.title}
            </h2>
            {block.content && (
              <div className="prose max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                <PortableText value={block.content as never} />
              </div>
            )}
          </motion.div>

          {/* Bloc Image */}
          {block.image && (
            <motion.div 
              initial={{ opacity: 0, x: imageFirst ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-lg">
                <Image
                  src={getImageUrl(block.image, 800, 85)}
                  alt={block.image.alt || block.title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}