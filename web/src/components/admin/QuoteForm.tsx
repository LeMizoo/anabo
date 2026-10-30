'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveQuoteDetails } from '@/app/admin/actions'
import { Loader2, CheckCircle2, Save } from 'lucide-react'

export function QuoteForm({ quoteId, initialDetails }: { quoteId: string, initialDetails: string }) {
  const router = useRouter()
  const [details, setDetails] = useState(initialDetails)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)

    startTransition(async () => {
      await saveQuoteDetails(quoteId, details)
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saved && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" /> Devis enregistré avec succès !
        </div>
      )}

      <div>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#E0A01C] focus:ring-1 focus:ring-[#E0A01C] font-mono"
          placeholder="Ex: Prix total : 1500€&#10;Inclus : Véhicule, chauffeur, essence, hébergement..."
        />
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