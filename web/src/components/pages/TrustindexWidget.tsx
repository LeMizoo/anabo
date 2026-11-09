'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { brandTextColor, titleCase, titleSizeClass } from '@/lib/typography'
import type { BrandTextColor } from '@/lib/types'

const LOADER_SRC = 'https://cdn.trustindex.io/loader.js?acb2ed78468d8473bb4605f645f'

const TEXTS: Record<
  string,
  { title: string; loading: string }
> = {
  fr: {
    title: 'Ils nous font confiance',
    loading: 'Chargement des avis…',
  },
  en: {
    title: 'They trust us',
    loading: 'Loading reviews…',
  },
  it: {
    title: 'Si fidano di noi',
    loading: 'Caricamento delle recensioni…',
  },
}

type Props = {
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
}

export function TrustindexWidget({ title, titleFont, titleWeight, titleColor, titleSize }: Props = {}) {
  const locale = useLocale()
  const t = TEXTS[locale] ?? TEXTS.fr
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasConsent, setHasConsent] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setHasConsent(localStorage.getItem('cookie-consent') === 'accepted')
  }, [])

  useEffect(() => {
    if (!hasConsent || !containerRef.current) return
    const container = containerRef.current

    const script = document.createElement('script')
    script.src = LOADER_SRC
    script.async = true
    script.defer = true
    script.onerror = () => setFailed(true)
    container.appendChild(script)

    const interval = window.setInterval(() => {
      if (container.querySelector('.ti-widget')) {
        setLoaded(true)
        window.clearInterval(interval)
        window.clearTimeout(timer)
      }
    }, 500)

    const timer = window.setTimeout(() => {
      window.clearInterval(interval)
      if (!container.querySelector('.ti-widget')) setFailed(true)
    }, 10000)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timer)
      script.remove()
    }
  }, [hasConsent])

  if (!hasConsent) return null

  return (
    <section className="bg-white">
      <div className="container-custom mx-auto max-w-6xl px-4">
        {/* 👇 CSS pour masquer les images de profil Tripadvisor 👇 */}
        <style jsx global>{`
          .ti-widget .ti-profile-img,
          .ti-widget .ti-profile-img img,
          .ti-widget .ti-review-item .ti-profile-img,
          .ti-widget .ti-review-item img.ti-profile-img {
            display: none !important;
          }
        `}</style>

        <h2
          className={`mb-12 text-center text-[#06245F] ${titleFont || 'font-euphoria'} ${titleWeight || 'font-normal'} ${titleSizeClass(titleSize)}`}
          style={{ color: brandTextColor(titleColor) }}
        >
          {titleCase(title || t.title)}
        </h2>
        <div ref={containerRef} className="min-h-[200px]">
          {!loaded && !failed && (
            <p className="text-center text-gray-400">{t.loading}</p>
          )}
        </div>
      </div>
    </section>
  )
}