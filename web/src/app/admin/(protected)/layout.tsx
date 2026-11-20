import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAdminAlerts } from '@/lib/admin-alerts'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const userRole = (session.user as { role?: string })?.role || 'ADMIN'
  const alerts = await getAdminAlerts()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar userRole={userRole} alerts={alerts} />
      {/* pt-16 sur mobile pour laisser passer le bouton menu, p-4, puis md:p-8 sur grand écran */}
      <main className="flex-1 overflow-y-auto w-full p-4 pt-20 md:pt-8 md:p-8">
        {children}
      </main>
    </div>
  )
}