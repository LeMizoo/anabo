'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteQuote } from '@/app/admin/actions'

export function DeleteQuoteForm({ quoteId, reference }: { quoteId: string; reference: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-red-700 hover:underline"
      >
        Supprimer cette demande…
      </button>
    )
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault()
        setError('')
        startTransition(async () => {
          try {
            await deleteQuote(quoteId, value)
            router.push('/admin/demandes')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Suppression impossible.')
          }
        })
      }}
    >
      <p className="text-xs text-red-800">
        Suppression définitive (spam, doublon, test). Tapez <strong>{reference}</strong> pour confirmer.
      </p>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-lg border border-red-300 px-3 py-1.5 text-sm"
        aria-label="Référence à confirmer"
        autoComplete="off"
      />
      {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || value.trim().toUpperCase() !== reference.toUpperCase()}
          className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? 'Suppression…' : 'Supprimer définitivement'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-600 hover:underline">
          Annuler
        </button>
      </div>
    </form>
  )
}
