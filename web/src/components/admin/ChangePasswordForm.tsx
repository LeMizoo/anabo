'use client'

import { useState, useTransition } from 'react'
import { changePassword } from '@/app/admin/actions'
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react'

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
        <input
          required
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
        <input
          required
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Minimum 10 caractères"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
        <input
          required
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

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