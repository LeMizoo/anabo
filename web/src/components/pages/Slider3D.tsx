'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { brandTextColor, subtitleSizeClass, titleCase, titleSizeClass } from '@/lib/typography'
import { localizeInternalPath } from '@/lib/localized-path'
import type { Locale } from '@/lib/i18n'
import type { BrandTextColor, ImagePresentation } from '@/lib/types'
import { imageContentStyle, imageFrameStyle } from './ImageFrame'
import { ImagePlaceholder } from './ImagePlaceholder'

type Slide = {
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  subtitle?: string
  subtitleFont?: string
  subtitleColor?: BrandTextColor
  subtitleSize?: string
  imagePosition?: string
  imageFit?: 'cover' | 'contain'
  imagePresentation?: ImagePresentation
  alt?: string
  linkLabel?: string
  linkUrl?: string
  imageUrl?: string
}

type Props = {
  block: {
    title?: string
    titleFont?: string
    titleWeight?: string
    titleColor?: BrandTextColor
    titleSize?: string
    autoplay?: boolean
    interval?: number
    slides?: Slide[]
  }
  locale: Locale
}

export function Slider3D({ block, locale }: Props) {
  const t = useTranslations('slider')
  const slides: Slide[] = block.slides?.length
    ? block.slides
    : Array.from({ length: 3 }, () => ({}))
  const n = slides.length
  const autoplay = block.autoplay ?? true
  const interval = block.interval ?? 5
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!autoplay || n < 2) return
    const timer = setInterval(() => setActive((a) => (a + 1) % n), interval * 1000)
    return () => clearInterval(timer)
  }, [autoplay, interval, n])

  return (
    <section className="overflow-hidden">
      <div className="container-custom">
        {block.title && (
          <h2
            className={`mb-8 text-center ${block.titleFont || 'font-caflisch'} ${block.titleWeight || 'font-normal'} ${titleSizeClass(block.titleSize)}`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title, locale)}
          </h2>
        )}

        <div
          className="relative mx-auto h-[320px] max-w-5xl sm:h-[420px]"
          style={{ perspective: '1200px' }}
        >
          {slides.map((s, i) => {
            let offset = i - active
            if (offset > n / 2) offset -= n
            if (offset < -n / 2) offset += n
            const abs = Math.abs(offset)
            const presentationStyle = imageFrameStyle(s.imagePresentation)

            return (
              <div
                key={i}
                onClick={() => setActive(i)}
                className="absolute left-1/2 top-0 h-full w-[70%] cursor-pointer overflow-hidden rounded-xl shadow-2xl transition-all duration-700 sm:w-[60%]"
                style={{
                  ...presentationStyle,
                  transform: `translateX(-50%) translateX(${offset * 55}%) translateZ(${-abs * 150}px) rotateY(${-offset * 35}deg) rotateZ(${s.imagePresentation?.rotation || 0}deg)`,
                  opacity: abs > 2 ? 0 : 1 - abs * 0.25,
                  zIndex: 10 - abs,
                  pointerEvents: abs > 2 ? 'none' : 'auto',
                }}
              >
                {s.imageUrl ? (
                  <Image
                    src={`${s.imageUrl}?w=900&auto=format`}
                    alt={s.alt || s.title || ''}
                    fill
                    className=""
                    sizes="(max-width: 640px) 70vw, 60vw"
                    priority={i === 0}
                    style={{
                      ...imageContentStyle(s.imagePresentation),
                      objectPosition: s.imagePresentation?.position || s.imagePosition || 'center',
                      objectFit: s.imagePresentation?.fit || s.imageFit || 'cover',
                    }}
                  />
                ) : (
                  <ImagePlaceholder locale={locale} />
                )}
                
                {(s.title || s.subtitle) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 text-white">
                    {s.title && (
                      <h3
                        className={`${s.titleFont || 'font-caflisch'} ${s.titleWeight || 'font-normal'} ${titleSizeClass(s.titleSize)}`}
                        style={{ color: brandTextColor(s.titleColor) }}
                      >
                        {s.title && titleCase(s.title, locale)}
                      </h3>
                    )}
                    {s.subtitle && (
                      <p
                        className={`mt-1 ${s.subtitleFont || 'font-sans'} ${subtitleSizeClass(s.subtitleSize)}`}
                        style={{ color: brandTextColor(s.subtitleColor) }}
                      >
                        {s.subtitle && titleCase(s.subtitle, locale)}
                      </p>
                    )}
                    
                    {/* 👇 Utilisation de la traduction ici 👇 */}
                    {s.linkUrl && i === active && (
                      <Link
                        href={localizeInternalPath(s.linkUrl, locale)}
                        className="mt-3 inline-block text-sm underline"
                      >
                        {s.linkLabel || t('learnMore')}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={t('slide', { number: i + 1 })}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === active ? 'bg-gray-900' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}