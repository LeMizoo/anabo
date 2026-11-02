'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // On vérifie si l'utilisateur a déjà fait un choix
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
    // On recharge la page pour que le widget Trustindex puisse s'afficher
    window.location.reload()
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 flex-1">
          <p>
            Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et afficher nos avis Tripadvisor. 
            Conformément à la réglementation, nous vous demandons votre autorisation.{' '}
            <Link href="/politique-cookies" className="text-blue-600 underline">
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {/* Bouton Refuser (aussi visible que Accepter) */}
          <button
            onClick={handleDecline}
            className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tout refuser
          </button>
          
          {/* Bouton Accepter */}
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-white bg-[#06245F] rounded-lg hover:bg-blue-900 transition-colors"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  )
}