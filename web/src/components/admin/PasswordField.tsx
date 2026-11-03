'use client'

import { useState, type ChangeEventHandler, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Props = {
  id: string
  label: string
  value: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  autoComplete?: string
  required?: boolean
  placeholder?: string
  name?: string
  disabled?: boolean
  readOnly?: boolean
  minLength?: number
  leadingIcon?: ReactNode
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  required,
  placeholder,
  name,
  disabled,
  readOnly,
  minLength,
  leadingIcon,
}: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leadingIcon}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          minLength={minLength}
          className={`w-full rounded-lg border border-gray-300 py-2.5 pr-12 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 ${
            leadingIcon ? 'pl-10' : 'pl-3'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={`${visible ? 'Masquer' : 'Afficher'} ${label.toLowerCase()}`}
          aria-controls={id}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-lg text-gray-500 transition hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 disabled:cursor-not-allowed"
        >
          {visible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
