'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Slide = {
  title?: string
  subtitle?: string
  alt?: string
  linkLabel?: string
  linkUrl?: string
  imageUrl?: string
}

type Props = {
  block: {
    title?: string
    autoplay?: boolean
    interval?: number
    slides?: Slide[]
  }
}

export function Slider3D({ block }: Props) {
  const slides = (block.slides ?? []).filter((s) => s.imageUrl)
  const n = slides.length
  const autoplay = block.autoplay ?? true
  const interval = block.interval ?? 5
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!autoplay || n < 2) return
    const t = setInterval(() => setActive((a) => (a + 1) % n), interval * 1000)
    return () => clearInterval(t)
  }, [autoplay, interval, n])

  if (n === 0) return null

  return (
    <section className="overflow-hidden py-16">
      <div className="container-custom">
        {block.title && (
          <h2 className="mb-10 text-center text-3xl font-bold">{block.title}</h2>
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

            return (
              <div
                key={i}
                onClick={() => setActive(i)}
                className="absolute left-1/2 top-0 h-full w-[70%] cursor-pointer overflow-hidden rounded-xl shadow-2xl transition-all duration-700 sm:w-[60%]"
                style={{
                  transform: `translateX(-50%) translateX(${offset * 55}%) translateZ(${-abs * 150}px) rotateY(${-offset * 35}deg)`,
                  opacity: abs > 2 ? 0 : 1 - abs * 0.25,
                  zIndex: 10 - abs,
                  pointerEvents: abs > 2 ? 'none' : 'auto',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${s.imageUrl}?w=900&auto=format`}
                  alt={s.alt || s.title || ''}
                  className="h-full w-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
                {(s.title || s.subtitle) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 text-white">
                    {s.title && <h3 className="text-xl font-semibold">{s.title}</h3>}
                    {s.subtitle && <p className="mt-1 text-sm">{s.subtitle}</p>}
                    {s.linkUrl && i === active && (
                      <Link
                        href={s.linkUrl}
                        className="mt-3 inline-block text-sm underline"
                      >
                        {s.linkLabel || 'En savoir plus'}
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
              aria-label={`Slide ${i + 1}`}
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