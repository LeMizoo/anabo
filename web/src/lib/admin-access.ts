import { cache } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type AdminRoleName = 'ADMIN' | 'SUPER_ADMIN' | 'CHAUFFEUR'

export const ROLE_LABELS: Record<AdminRoleName, string> = {
  SUPER_ADMIN: 'Super-administrateur',
  ADMIN: 'Administrateur',
  CHAUFFEUR: 'Chauffeur',
}

export type CurrentAdmin = {
  id: string
  name: string
  email: string
  role: AdminRoleName
  driverId: string | null
}

/**
 * Compte connecté, relu en base à chaque requête (une seule lecture par rendu) :
 * un changement de rôle ou une désactivation s'applique immédiatement,
 * sans attendre l'expiration de la session.
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const session = await auth()
  const id = (session?.user as { id?: string } | undefined)?.id
  if (!id) return null
  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, active: true, driverId: true },
  })
  if (!user || !user.active) return null
  return { id: user.id, name: user.name, email: user.email, role: user.role as AdminRoleName, driverId: user.driverId }
})

/** Pages accessibles à un compte Chauffeur (le reste de l'administration lui est fermé). */
export const CHAUFFEUR_PATHS = ['/admin/planning', '/admin/mon-compte']

export function canAccessPath(role: AdminRoleName, pathname: string) {
  if (role !== 'CHAUFFEUR') return true
  return CHAUFFEUR_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export const isStaff = (role?: AdminRoleName | null) => role === 'ADMIN' || role === 'SUPER_ADMIN'

/** Tout compte actif (y compris Chauffeur) : mon compte, notifications. */
export async function requireAdminUser() {
  const user = await getCurrentAdmin()
  if (!user) throw new Error('Non autorisé')
  return user
}

/** Équipe d'administration (ADMIN ou SUPER_ADMIN) : demandes, planning complet, chauffeurs. */
export async function requireStaff() {
  const user = await requireAdminUser()
  if (!isStaff(user.role)) throw new Error('Action réservée à l’équipe d’administration.')
  return user
}

/** SUPER_ADMIN uniquement : prix, paiement, utilisateurs, comptabilité. */
export async function requireSuperAdmin() {
  const user = await requireAdminUser()
  if (user.role !== 'SUPER_ADMIN') throw new Error('Seul un SUPER_ADMIN peut effectuer cette action.')
  return user
}
