'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'

type Props = {
  phone?: string
  enabled?: boolean
  locale: string
}

const labels: Record<string, string> = {
  fr: 'Contacter ANABO sur WhatsApp',
  en: 'Contact ANABO on WhatsApp',
  it: 'Contatta ANABO su WhatsApp',
}

export function FloatingWhatsApp({ phone, enabled = true, locale }: Props) {
  const [cookieChoiceMade, setCookieChoiceMade] = useState(false)

  useEffect(() => {
    setCookieChoiceMade(localStorage.getItem('cookie-consent') !== null)
  }, [])

  if (!enabled) return null

  const digits = (phone || '+261341491454').replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return null

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={labels[locale] || labels.en}
      className={`fixed right-5 z-[110] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-[bottom,transform,background-color] hover:scale-105 hover:bg-[#1ebe5d] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 focus-visible:ring-offset-2 ${
        cookieChoiceMade ? 'bottom-5' : 'bottom-56 md:bottom-32'
      }`}
    >
      <MessageCircle className="h-7 w-7" strokeWidth={2.2} aria-hidden="true" />
    </a>
  )
}
