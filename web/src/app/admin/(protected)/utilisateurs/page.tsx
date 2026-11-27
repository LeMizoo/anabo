import { redirect } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin, ROLE_LABELS, type AdminRoleName } from '@/lib/admin-access'
import { AdminUserForm } from '@/components/admin/AdminUserForm'
import { UserStatusToggle } from '@/components/admin/UserStatusToggle'
import { ConfirmSubmitButton } from '@/components/admin/BulkSelection'
import { deleteAdminUser, updateAdminUser } from '@/app/admin/actions'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ ok?: string; erreur?: string }> }

const ROLE_STYLES: Record<AdminRoleName, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-blue-100 text-blue-800',
  CHAUFFEUR: 'bg-amber-100 text-amber-800',
}

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

export default async function AdminUsersPage({ searchParams }: Props) {
  const me = await getCurrentAdmin()
  if (!me || me.role !== 'SUPER_ADMIN') redirect('/admin/dashboard')
  const { ok, erreur } = await searchParams

  const [users, drivers] = await Promise.all([
    prisma.adminUser.findMany({
      orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, name: true, email: true, role: true, active: true, driverId: true, lastLoginAt: true },
    }),
    prisma.driver.findMany({ orderBy: [{ active: 'desc' }, { name: 'asc' }], select: { id: true, name: true, active: true } }),
  ])
  type User = (typeof users)[number]
  const driverName = new Map(drivers.map((d) => [d.id, d.name]))
  const activeDrivers = drivers.filter((d) => d.active).map(({ id, name }) => ({ id, name }))
  const lastLogin = (d: Date | null) =>
    d ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Indian/Antananarivo' }) : 'jamais'

  // Formulaire de modification, replié dans la ligne (carte sur mobile, cellule sur grand écran).
  const editForm = (user: User) => {
    const isMe = user.id === me.id
    return (
      <details className="group">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Modifier
        </summary>
        <form action={updateAdminUser} className="mt-3 grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={user.id} />
          <label className="text-xs font-medium text-gray-600">
            Nom
            <input name="name" defaultValue={user.name} required maxLength={150} className={`mt-1 ${inputClass}`} />
          </label>
          <label className="text-xs font-medium text-gray-600">
            E-mail
            <input name="email" type="email" defaultValue={user.email} required maxLength={191} className={`mt-1 ${inputClass}`} />
          </label>
          <label className="text-xs font-medium text-gray-600">
            Rôle
            <select name={isMe ? undefined : 'role'} defaultValue={user.role} disabled={isMe} className={`mt-1 ${inputClass}`}>
              <option value="SUPER_ADMIN">{ROLE_LABELS.SUPER_ADMIN}</option>
              <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
              <option value="CHAUFFEUR">{ROLE_LABELS.CHAUFFEUR}</option>
            </select>
            {/* Son propre rôle ne se modifie pas (évite de perdre l'accès). */}
            {isMe && <input type="hidden" name="role" value={user.role} />}
          </label>
          <label className="text-xs font-medium text-gray-600">
            Fiche chauffeur liée <span className="font-normal text-gray-400">(rôle Chauffeur)</span>
            <select name="driverId" defaultValue={user.driverId || ''} className={`mt-1 ${inputClass}`}>
              <option value="">— Aucune —</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}{d.active ? '' : ' (inactif)'}</option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Enregistrer</button>
          </div>
        </form>
      </details>
    )
  }

  const deleteForm = (user: User) =>
    user.id === me.id ? (
      <span className="inline-flex items-center gap-1.5 px-1 py-1.5 text-xs text-gray-400" title="Vous ne pouvez pas supprimer votre propre compte">
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Suppression impossible (votre compte)
      </span>
    ) : (
      <form action={deleteAdminUser}>
        <input type="hidden" name="id" value={user.id} />
        <ConfirmSubmitButton
          label="Supprimer"
          confirmMessage={`Supprimer définitivement le compte de ${user.name} ? Cette action est irréversible.`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
        />
      </form>
    )

  const roleBadge = (role: AdminRoleName) => (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLES[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  )

  const driverInfo = (user: User) =>
    user.role === 'CHAUFFEUR' && (
      <div className="mt-1 text-xs text-gray-500">
        Fiche : {user.driverId ? driverName.get(user.driverId) || 'introuvable' : <span className="text-amber-700">non reliée</span>}
      </div>
    )

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="mt-1 text-gray-500">
          Gérez les accès à l&apos;administration. Un compte <strong>Chauffeur</strong> ne voit que ses voyages (« Mes voyages ») et son compte.
        </p>
      </div>

      {ok && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{ok}</p>}
      {erreur && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{erreur}</p>}

      <div className="grid grid-cols-1 gap-8 2xl:grid-cols-3">
        <div className="2xl:col-span-1">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Inviter un utilisateur</h2>
            <AdminUserForm drivers={activeDrivers} />
          </div>
        </div>

        <div className="2xl:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {/* Mobile et tablette : une carte par utilisateur. */}
            <ul className="divide-y divide-gray-100 2xl:hidden">
              {users.map((user) => (
                <li key={user.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">
                        {user.name}{user.id === me.id && <span className="ml-1 text-xs font-normal text-gray-500">(vous)</span>}
                      </div>
                      <div className="break-all text-sm text-gray-600">{user.email}</div>
                      {driverInfo(user)}
                      <div className="text-xs text-gray-400">Dernière connexion : {lastLogin(user.lastLoginAt)}</div>
                    </div>
                    {roleBadge(user.role as AdminRoleName)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <UserStatusToggle userId={user.id} initialActive={user.active} />
                    {deleteForm(user)}
                  </div>
                  {editForm(user)}
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto 2xl:block">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Utilisateur</th>
                    <th className="px-4 py-3 font-medium">Rôle</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="align-top hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {user.name}{user.id === me.id && <span className="ml-1 text-xs font-normal text-gray-500">(vous)</span>}
                        </div>
                        <div className="text-gray-600">{user.email}</div>
                        <div className="text-xs text-gray-400">Dernière connexion : {lastLogin(user.lastLoginAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        {roleBadge(user.role as AdminRoleName)}
                        {driverInfo(user)}
                      </td>
                      <td className="px-4 py-3">
                        <UserStatusToggle userId={user.id} initialActive={user.active} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-start gap-2">
                          {editForm(user)}
                          {deleteForm(user)}
                        </div>
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
