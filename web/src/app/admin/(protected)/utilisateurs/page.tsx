import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminUserForm } from '@/components/admin/AdminUserForm'
import { UserStatusToggle } from '@/components/admin/UserStatusToggle'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role

  if (userRole !== 'SUPER_ADMIN') {
    redirect('/admin/dashboard')
  }

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-500 mt-1">Gérez les accès à l&apos;administration.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 2xl:grid-cols-3">
        <div className="2xl:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inviter un utilisateur</h2>
            <AdminUserForm />
          </div>
        </div>

        <div className="2xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Mobile : une carte par utilisateur. */}
            <ul className="divide-y divide-gray-100 2xl:hidden">
              {users.map((user) => (
                <li key={user.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="break-all text-sm text-gray-600">{user.email}</div>
                    </div>
                    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <UserStatusToggle userId={user.id} initialActive={user.active} />
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto 2xl:block">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nom</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Rôle</th>
                    <th className="px-4 py-3 font-medium">Statut & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <UserStatusToggle userId={user.id} initialActive={user.active} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}