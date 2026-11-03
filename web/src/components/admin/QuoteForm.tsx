'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveQuoteDetails } from '@/app/admin/actions'
import { Loader2, CheckCircle2, Save, AlertCircle } from 'lucide-react'

export function QuoteForm({ quoteId, initialDetails }: { quoteId: string, initialDetails: string }) {
  const router = useRouter()
  const [details, setDetails] = useState(initialDetails)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    setError('')

    startTransition(async () => {
      try {
        await saveQuoteDetails(quoteId, details)
        setSaved(true)
        router.refresh()
        setTimeout(() => setSaved(false), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible d’enregistrer le devis.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saved && (
        <div role="status" className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" /> Devis enregistré avec succès !
        </div>
      )}
      {error && (
        <div role="alert" className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      <div>
        <label htmlFor="quote-details" className="mb-1 block text-sm font-medium text-gray-700">
          Contenu du devis
        </label>
        <textarea
          id="quote-details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={8}
          maxLength={20000}
          disabled={isPending}
          aria-describedby="quote-details-count"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#E0A01C] focus:ring-2 focus:ring-[#E0A01C]/30 disabled:bg-gray-50 font-mono"
          placeholder="Ex: Prix total : 1500€&#10;Inclus : Véhicule, chauffeur, essence, hébergement..."
        />
        <p id="quote-details-count" className="mt-1 text-right text-xs text-gray-500">
          {details.length.toLocaleString('fr-FR')} / 20 000
        </p>
      </div>
      <button 
        type="submit" 
        disabled={isPending}
        className="rounded-lg bg-[#E0A01C] px-6 py-3 font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Enregistrer le devis
      </button>
    </form>
  )
}