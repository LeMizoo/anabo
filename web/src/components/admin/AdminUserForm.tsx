'use client'

import { useState, useTransition } from 'react'
import { createAdminUser } from '@/app/admin/actions'
import { Loader2, UserPlus, CheckCircle2 } from 'lucide-react'

export function AdminUserForm() {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('ADMIN')
  const [success, setSuccess] = useState<{
    email: string
    password: string
  } | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)
    setError('')

    startTransition(async () => {
      try {
        const result = await createAdminUser({ name, email, role })

        if (result.success && result.tempPassword) {
          setSuccess({ email, password: result.tempPassword })
          setName('')
          setEmail('')
        } else {
          setError('La création a échoué. Vérifiez les informations.')
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Une erreur est survenue.'
        )
      }
    })
  }

  if (success) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 text-green-800 font-bold mb-2">
          <CheckCircle2 className="w-5 h-5" />
          Utilisateur créé !
        </div>

        <p className="text-sm text-green-700 mb-2">
          L'utilisateur a reçu un email avec ses identifiants. Voici également une sauvegarde :
        </p>

        <div className="bg-white p-3 rounded border text-sm font-mono space-y-1 text-gray-800">
          <p><strong>Email :</strong> {success.email}</p>
          <p><strong>Mot de passe :</strong> {success.password}</p>
        </div>

        <button
          type="button"
          onClick={() => setSuccess(null)}
          className="mt-4 text-sm text-green-700 underline hover:text-green-900"
        >
          Créer un autre utilisateur
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom complet
        </label>
        <input
          required
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rôle
        </label>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="ADMIN">Administrateur (gère les demandes)</option>
          <option value="SUPER_ADMIN">Super Administrateur (accès total)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        Créer l'utilisateur
      </button>
    </form>
  )
}