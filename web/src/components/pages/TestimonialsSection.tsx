'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getImageUrl } from '@/lib/sanity'
import { brandTextColor, titleCase, titleSizeClass } from '@/lib/typography'
import type { SanityImage } from '@/lib/types'

type Testimonial = {
  _id: string
  authorName: string
  authorCountry?: string
  authorPhoto?: SanityImage
  testimonialImage?: SanityImage
  content: string
  rating?: number
}

type Props = {
  block: {
    title?: string
    titleFont?: string
    titleColor?: 'navy' | 'gold' | 'charcoal' | 'white'
    titleSize?: string
    layout?: 'carousel' | 'grid'
    testimonials?: Testimonial[]
  }
}

export function TestimonialsSection({ block }: Props) {
  const testimonials = block.testimonials || []
  const [currentIndex, setCurrentIndex] = useState(0)

  if (testimonials.length === 0) return null

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  const renderStars = (rating = 5) => (
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )

  const renderAuthor = (t: Testimonial) => {
    const authorPhotoUrl = t.authorPhoto
      ? getImageUrl(t.authorPhoto, 100, 80)
      : null

    return (
      <div className="flex items-center gap-3 mt-6">
        {authorPhotoUrl ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={authorPhotoUrl}
              alt={t.authorName}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#06245F] text-white flex items-center justify-center font-bold">
            {t.authorName.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{t.authorName}</p>
          {t.authorCountry && <p className="text-xs text-gray-500">{t.authorCountry}</p>}
        </div>
      </div>
    )
  }

  const renderTestimonialImage = (t: Testimonial) => {
    const imageUrl = t.testimonialImage
      ? getImageUrl(t.testimonialImage, 1000, 85)
      : null
    if (!imageUrl) return null

    return (
      <div className="relative mb-5 aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={imageUrl}
          alt={t.testimonialImage?.alt || `Photo du voyage de ${t.authorName}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    )
  }

  // --- AFFICHAGE EN GRILLE ---
  if (block.layout === 'grid') {
    return (
      <section className="bg-gray-50">
        <div className="container-custom">
          <h2
            className={`text-center text-[#06245F] mb-8 font-bold ${block.titleFont || 'font-serif'} ${titleSizeClass(block.titleSize)}`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title || 'Ce que nos voyageurs disent')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t._id} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                {renderTestimonialImage(t)}
                {renderStars(t.rating)}
                <p className="text-gray-700 italic flex-1 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                {renderAuthor(t)}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // --- AFFICHAGE EN CAROUSEL (Par défaut) ---
  return (
    <section className="bg-gray-50 overflow-hidden">
      <div className="container-custom">
        <h2
          className={`text-center text-[#06245F] mb-8 font-bold ${block.titleFont || 'font-serif'} ${titleSizeClass(block.titleSize)}`}
          style={{ color: brandTextColor(block.titleColor) }}
        >
          {titleCase(block.title || 'Ce que nos voyageurs disent')}
        </h2>

        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 min-h-[300px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {renderTestimonialImage(testimonials[currentIndex])}
                <div className="flex justify-center">{renderStars(testimonials[currentIndex].rating)}</div>
                <p className="text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-8">
                  &ldquo;{testimonials[currentIndex].content}&rdquo;
                </p>
                <div className="flex justify-center">
                  {renderAuthor(testimonials[currentIndex])}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Boutons de navigation */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 bg-white p-3 rounded-full shadow-md text-gray-600 hover:text-[#06245F] transition-colors"
                aria-label="Précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={next}
                className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 bg-white p-3 rounded-full shadow-md text-gray-600 hover:text-[#06245F] transition-colors"
                aria-label="Suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Points de navigation */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-[#06245F]' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Aller au témoignage ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}