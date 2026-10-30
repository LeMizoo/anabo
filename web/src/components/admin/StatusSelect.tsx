'use client'

import { useState, useTransition } from 'react'
import { updateQuoteStatus } from '@/app/admin/actions'
import { QuoteStatus } from '@prisma/client'
import { Loader2 } from 'lucide-react'

const statuses: { value: QuoteStatus; label: string; color: string }[] = [
  { value: 'NOUVEAU', label: 'Nouveau', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTACTE', label: 'Contacté', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'DEVIS_ENVOYE', label: 'Devis envoyé', color: 'bg-purple-100 text-purple-800' },
  { value: 'CONFIRME', label: 'Confirmé', color: 'bg-green-100 text-green-800' },
  { value: 'PERDU', label: 'Perdu', color: 'bg-red-100 text-red-800' },
]

export function StatusSelect({ quoteId, currentStatus }: { quoteId: string, currentStatus: QuoteStatus }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<QuoteStatus>(currentStatus)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as QuoteStatus
    setStatus(newStatus)
    
    startTransition(async () => {
      await updateQuoteStatus(quoteId, newStatus)
    })
  }

  const currentColor = statuses.find(s => s.value === status)?.color || 'bg-gray-100'

  return (
    <div className="relative flex items-center">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className={`appearance-none rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer outline-none border-none ${currentColor} ${isPending ? 'opacity-50' : ''}`}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {isPending && <Loader2 className="w-3 h-3 ml-1 animate-spin text-gray-500" />}
    </div>
  )
}