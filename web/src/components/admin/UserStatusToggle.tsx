'use client'

import { useState, useTransition } from 'react'
import { toggleAdminUserStatus, resendAdminUserInvitation } from '@/app/admin/actions'
import { Loader2, Mail } from 'lucide-react'

export function UserStatusToggle({ userId, initialActive }: { userId: string, initialActive: boolean }) {
  const [isActive, setIsActive] = useState(initialActive)
  const [isPending, startTransition] = useTransition()
  const [isResending, startResending] = useTransition()

  const handleToggle = () => {
    const newStatus = !isActive
    setIsActive(newStatus)

    startTransition(async () => {
      try {
        await toggleAdminUserStatus(userId, newStatus)
      } catch (error) {
        setIsActive(!newStatus)
        alert(error instanceof Error ? error.message : 'Erreur lors de la modification')
      }
    })
  }

  const handleResend = () => {
    if (!confirm('Voulez-vous vraiment renvoyer un email avec un nouveau mot de passe temporaire ?')) return;

    startResending(async () => {
      try {
        const result = await resendAdminUserInvitation(userId)
        alert(`Email renvoyé avec succès ! Le nouveau mot de passe temporaire est : ${result.tempPassword}`)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erreur lors de l\'envoi')
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
          isActive 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isActive ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
      >
        {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
        {isActive ? 'Actif' : 'Inactif'}
      </button>

      <button
        onClick={handleResend}
        disabled={isResending}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        title="Renvoyer les identifiants par email"
      >
        {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
      </button>
    </div>
  )
}