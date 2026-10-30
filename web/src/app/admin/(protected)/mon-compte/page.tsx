import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ChangePasswordForm } from '@/components/admin/ChangePasswordForm'

export const dynamic = 'force-dynamic'

export default async function MonComptePage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connecté en tant que <strong>{session.user?.name}</strong> ({session.user?.email})
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Changer de mot de passe</h2>
        <ChangePasswordForm />
      </div>
    </div>
  )
}