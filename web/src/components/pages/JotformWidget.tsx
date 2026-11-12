
'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { brandTextColor, titleCase, titleSizeClass } from '@/lib/typography'
import type { BrandTextColor } from '@/lib/types'

const JOTFORM_WIDGET_ID =
  '01a1ca2cc4b070008c5f6a0c0746e3ba68b6'

const JOTFORM_CONTAINER_ID =
  `JFWebsiteWidget-${JOTFORM_WIDGET_ID}`

const JOTFORM_SCRIPT_SRC =
  `https://www.jotform.com/website-widgets/embed/${JOTFORM_WIDGET_ID}`

const TEXTS: Record<
  string,
  { title: string; loading: string; error: string }
> = {
  fr: {
    title: 'Ils nous font confiance',
    loading: 'Chargement des avis Tripadvisor…',
    error: 'Les avis Tripadvisor ne sont pas disponibles pour le moment.',
  },
  en: {
    title: 'They trust us',
    loading: 'Loading Tripadvisor reviews…',
    error: 'Tripadvisor reviews are currently unavailable.',
  },
  it: {
    title: 'Si fidano di noi',
    loading: 'Caricamento delle recensioni Tripadvisor…',
    error: 'Le recensioni Tripadvisor non sono disponibili al momento.',
  },
}

type Props = {
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
}

export function JotformWidget({
  title,
  titleFont,
  titleWeight,
  titleColor,
  titleSize,
}: Props = {}) {
  const locale = useLocale()
  const t = TEXTS[locale] ?? TEXTS.fr

  const containerRef = useRef<HTMLDivElement>(null)

  const [hasConsent, setHasConsent] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setHasConsent(
      localStorage.getItem('cookie-consent') === 'accepted',
    )
  }, [])

  useEffect(() => {
    if (!hasConsent || !containerRef.current) return

    const container = containerRef.current
    const widgetContainer = container.querySelector(
      `#${JOTFORM_CONTAINER_ID}`,
    )

    if (!widgetContainer) return

    setLoaded(false)
    setFailed(false)

    const script = document.createElement('script')
    script.src = JOTFORM_SCRIPT_SRC
    script.defer = true

    const timeout = window.setTimeout(() => {
      setFailed(true)
    }, 15000)

    script.onload = () => {
      window.clearTimeout(timeout)
      setLoaded(true)
    }

    script.onerror = () => {
      window.clearTimeout(timeout)
      setFailed(true)
    }

    container.appendChild(script)

    return () => {
      window.clearTimeout(timeout)
      script.remove()
      widgetContainer.innerHTML = ''
    }
  }, [hasConsent])

  if (!hasConsent) return null

  return (
    <section className="bg-white">
      <div className="container-custom mx-auto max-w-6xl px-4">
        <h2
          className={`mb-12 text-center text-[#06245F] ${
            titleFont || 'font-euphoria'
          } ${titleWeight || 'font-normal'} ${titleSizeClass(titleSize)}`}
          style={{ color: brandTextColor(titleColor) }}
        >
          {titleCase(title || t.title, locale)}
        </h2>

        <div
          ref={containerRef}
          className="min-h-[200px]"
        >
          <div id={JOTFORM_CONTAINER_ID} />

          {!loaded && !failed && (
            <p className="text-center text-gray-400">
              {t.loading}
            </p>
          )}

          {failed && (
            <p className="text-center text-gray-400">
              {t.error}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
