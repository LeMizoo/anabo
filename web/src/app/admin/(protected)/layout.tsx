import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { getAdminAlerts } from '@/lib/admin-alerts'
import { canAccessPath, getCurrentAdmin, isStaff } from '@/lib/admin-access'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Compte relu en base : un compte désactivé ou supprimé est déconnecté immédiatement.
  const user = await getCurrentAdmin()
  if (!user) redirect('/admin/login')

  // Un compte Chauffeur n'accède qu'à ses voyages et à son compte.
  const pathname = (await headers()).get('x-admin-pathname') || ''
  if (!canAccessPath(user.role, pathname)) redirect('/admin/planning')

  const userRole = user.role
  const alerts = isStaff(user.role) ? await getAdminAlerts() : null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar userRole={userRole} alerts={alerts} />
      {/* pt-20 sur mobile pour laisser passer le bouton menu. Pas d’overflow ici : c’est la fenêtre qui défile, ce qui permet aux barres « sticky » de rester visibles. */}
      <main className="min-w-0 flex-1 w-full p-4 pt-20 md:pt-8 md:p-8">
        {children}
      </main>
    </div>
  )
}