'use client'

import { useState, useTransition } from 'react'
import { changePassword } from '@/app/admin/actions'
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import { PasswordField } from './PasswordField'

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.')
      return
    }

    if (newPassword.length < 10) {
      setError('Le nouveau mot de passe doit faire au moins 10 caractères.')
      return
    }

    startTransition(async () => {
      try {
        await changePassword(currentPassword, newPassword)
        setSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      }
    })
  }

  if (success) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-green-600" />
        <div>
          <p className="font-medium text-green-800">Mot de passe mis à jour avec succès !</p>
          <p className="text-sm text-green-700">Votre nouveau mot de passe est maintenant actif.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}

      <PasswordField
        id="current-password"
        label="Mot de passe actuel"
        value={currentPassword}
        onChange={e => setCurrentPassword(e.target.value)}
        autoComplete="current-password"
        required
        disabled={isPending}
      />

      <PasswordField
        id="new-password"
        label="Nouveau mot de passe"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        autoComplete="new-password"
        required
        minLength={10}
        disabled={isPending}
        placeholder="Minimum 10 caractères"
      />

      <PasswordField
        id="confirm-password"
        label="Confirmer le nouveau mot de passe"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
        required
        minLength={10}
        disabled={isPending}
      />

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
        Mettre à jour le mot de passe
      </button>
    </form>
  )
}