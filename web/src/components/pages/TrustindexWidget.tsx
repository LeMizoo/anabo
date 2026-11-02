'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'

const LOADER_SRC = 'https://cdn.trustindex.io/loader.js?acb2ed78468d8473bb4605f645f'
const TRIPADVISOR_URL =
  process.env.NEXT_PUBLIC_TRIPADVISOR_URL || 'https://www.tripadvisor.com'

const TEXTS: Record<
  string,
  { title: string; loading: string; failed: string; link: string }
> = {
  fr: {
    title: 'Ils nous font confiance',
    loading: 'Chargement des avis…',
    failed: 'Les avis ne peuvent pas s’afficher pour le moment.',
    link: 'Voir nos avis sur Tripadvisor',
  },
  en: {
    title: 'They trust us',
    loading: 'Loading reviews…',
    failed: 'Reviews cannot be displayed right now.',
    link: 'See our reviews on Tripadvisor',
  },
  it: {
    title: 'Si fidano di noi',
    loading: 'Caricamento delle recensioni…',
    failed: 'Le recensioni non sono disponibili al momento.',
    link: 'Vedi le nostre recensioni su Tripadvisor',
  },
}

export function TrustindexWidget() {
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
    <section className="bg-white py-16">
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

        <h2 className="mb-12 text-center font-serif text-3xl font-bold text-[#06245F]">
          {t.title}
        </h2>
        <div ref={containerRef} className="min-h-[200px]">
          {!loaded && !failed && (
            <p className="text-center text-gray-400">{t.loading}</p>
          )}
          {failed && !loaded && (
            <p className="text-center text-gray-600">
              {t.failed}{' '}
              <a
                href={TRIPADVISOR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline"
              >
                {t.link}
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}