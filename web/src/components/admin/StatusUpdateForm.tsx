'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateQuoteStatus } from '@/app/admin/actions'
import { QuoteStatus } from '@prisma/client'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function StatusUpdateForm({ 
  quoteId, 
  currentStatus, 
  currentNotes 
}: { 
  quoteId: string, 
  currentStatus: QuoteStatus, 
  currentNotes: string 
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [status, setStatus] = useState<QuoteStatus>(currentStatus)
  const [notes, setNotes] = useState(currentNotes)
  
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    startTransition(async () => {
      const result = await updateQuoteStatus(quoteId, status, notes)
      
      if (result.emailError) {
        setErrorMsg(result.emailError)
        router.refresh()
      } else {
        if (result.emailSent) {
          setSuccessMsg('Statut mis à jour et e-mail envoyé au client ! Redirection vers le tableau de bord...')
        } else if (result.statusChanged) {
          setSuccessMsg('Statut mis à jour avec succès ! Redirection vers le tableau de bord...')
        } else {
          setSuccessMsg('Aucune modification nécessaire (statut identique). Redirection vers le tableau de bord...')
        }

        setTimeout(() => {
          router.push('/admin/dashboard')
          router.refresh()
        }, 1500)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-5 h-5" /> {errorMsg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value as QuoteStatus)} 
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-800 focus:ring-1 focus:ring-gray-800"
          >
            <option value="NOUVEAU">Nouveau</option>
            <option value="CONTACTE">Contacté</option>
            <option value="DEVIS_ENVOYE">Devis envoyé</option>
            <option value="CONFIRME">Confirmé</option>
            <option value="PERDU">Perdu</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes internes</label>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            rows={1} 
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-800 focus:ring-1 focus:ring-gray-800" 
            placeholder="Notes privées..." 
          />
        </div>
      </div>
      
      <div className="flex justify-end pt-2">
        <button 
          type="submit" 
          disabled={isPending}
          className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50 flex items-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Mettre à jour le statut et notifier
        </button>
      </div>
    </form>
  )
}