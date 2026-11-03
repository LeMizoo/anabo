'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, Monitor } from 'lucide-react'
import { PasswordField } from '@/components/admin/PasswordField'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect.')
      } else {
        router.push('/admin/dashboard')
        router.refresh()
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            ANABO — Administration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connectez-vous pour accéder au tableau de bord.
          </p>
        </div>

        {/* NOUVEL ENCART D'INFORMATION */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3 text-sm text-blue-800">
          <Monitor className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            L&apos;outil d&apos;administration est optimisé pour les ordinateurs et tablettes.
            Certaines fonctionnalités peuvent être limitées sur un écran de téléphone.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} aria-busy={isLoading}>
          {error && (
            <div role="alert" className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="admin@anabo.mg"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <PasswordField
              id="login-password"
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={isLoading}
              placeholder="••••••••"
              leadingIcon={<Lock className="h-5 w-5" />}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}