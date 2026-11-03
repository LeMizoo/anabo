'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

type Props = {
  label: string
  pendingLabel: string
  className: string
}

export function FormSubmitButton({ label, pendingLabel, className }: Props) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={className}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? pendingLabel : label}
    </button>
  )
}
