'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { getImageUrl } from '@/lib/sanity'
import type { SanityImage } from '@/lib/types'

type PuzzleItem = {
  _key: string
  image: SanityImage
  size: 'small' | 'wide' | 'tall' | 'large'
  caption?: string
}

type Props = {
  block: {
    title?: string
    items?: PuzzleItem[]
  }
}

export function PuzzleGallery({ block }: Props) {
  if (!block.items || block.items.length === 0) return null

  const getItemClasses = (size: string) => {
    switch (size) {
      case 'wide': return 'col-span-2 row-span-1 aspect-[2/1]'
      case 'tall': return 'col-span-1 row-span-2 aspect-[1/2]'
      case 'large': return 'col-span-2 row-span-2 aspect-square'
      default: return 'col-span-1 row-span-1 aspect-square'
    }
  }

  // Génère un léger décalage aléatoire mais stable basé sur l'index
  const getRandomOffset = (index: number) => {
    const offsets = ['md:translate-y-4', 'md:-translate-y-4', 'md:translate-y-8', 'md:-translate-y-2', 'md:translate-y-2'];
    return offsets[index % offsets.length];
  }

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="container-custom max-w-6xl mx-auto px-4">
        {block.title && (
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-[#06245F] mb-8" // mb-12 -> mb-8
          >
            {block.title}
          </motion.h2>
        )}

        {/* gap-4 -> gap-2 md:gap-4 pour resserrer + auto-rows plus petits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 auto-rows-[150px] md:auto-rows-[200px]">
          {block.items.map((item, index) => (
            <motion.div
              key={item._key}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              // Ajout de la rotation et du décalage pour l'effet "désordonné"
              className={`relative rounded-xl overflow-hidden group ${getItemClasses(item.size)} ${getRandomOffset(index)} md:rotate-1`}
            >
              <Image
                src={getImageUrl(item.image, 800, 80)}
                alt={item.image.alt || item.caption || 'Galerie'}
                fill
                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                {item.caption && (
                  <p className="text-white font-medium text-sm md:text-base translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {item.caption}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}