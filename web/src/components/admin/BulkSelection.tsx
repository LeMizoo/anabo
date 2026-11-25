'use client'

import { useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

/** Case « tout sélectionner » pour les cases `input[data-bulk]` de la page. */
export function SelectAllCheckbox({ label = 'Tout sélectionner sur cette page' }: { label?: string }) {
  const [checked, setChecked] = useState(false)
  return (
    <input
      type="checkbox"
      aria-label={label}
      title={label}
      checked={checked}
      onChange={(e) => {
        setChecked(e.target.checked)
        document.querySelectorAll<HTMLInputElement>('input[data-bulk]').forEach((box) => {
          box.checked = e.target.checked
          box.dispatchEvent(new Event('change', { bubbles: true }))
        })
      }}
      className="h-4 w-4 rounded border-gray-300 text-blue-700"
    />
  )
}

/** Bouton d'envoi de la sélection : affiche le nombre de demandes cochées. */
export function BulkSubmitButton({ label, formId }: { label: string; formId: string }) {
  const [count, setCount] = useState(0)
  const { pending } = useFormStatus()
  useEffect(() => {
    const update = () =>
      setCount(new Set([...document.querySelectorAll<HTMLInputElement>('input[data-bulk]:checked')].map((box) => box.value)).size)
    update()
    document.addEventListener('change', update)
    return () => document.removeEventListener('change', update)
  }, [])
  return (
    <button
      type="submit"
      form={formId}
      disabled={count === 0 || pending}
      className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {label} ({count})
    </button>
  )
}

/** Bouton d'envoi avec confirmation (actions groupées). */
export function ConfirmSubmitButton({
  label,
  confirmMessage,
  disabled,
  className,
}: {
  label: string
  confirmMessage: string
  disabled?: boolean
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault()
      }}
      className={
        className ||
        'inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
      }
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {label}
    </button>
  )
}
