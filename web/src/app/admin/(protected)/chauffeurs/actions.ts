'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/admin-access'
import { prisma } from '@/lib/prisma'

async function requireSession() {
  return { user: await requireStaff() }
}

const text = (formData: FormData, key: string, max: number) => {
  const value = String(formData.get(key) || '').trim().slice(0, max)
  return value || null
}

function back(message: string, isError = false): never {
  redirect(`/admin/chauffeurs?${isError ? 'erreur' : 'ok'}=${encodeURIComponent(message)}`)
}

function refresh() {
  revalidatePath('/admin/chauffeurs')
  revalidatePath('/admin/planning')
  revalidatePath('/admin/dashboard')
}

export async function saveDriver(formData: FormData) {
  await requireSession()
  const id = text(formData, 'id', 30)
  const name = text(formData, 'name', 150)
  if (!name) back('Le nom du chauffeur est obligatoire.', true)

  const email = text(formData, 'email', 191)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) back('E-mail invalide.', true)

  const seatsRaw = text(formData, 'vehicleSeats', 3)
  const vehicleSeats = seatsRaw ? Number(seatsRaw) : null
  if (vehicleSeats !== null && (!Number.isInteger(vehicleSeats) || vehicleSeats < 1 || vehicleSeats > 60)) {
    back('Nombre de places invalide.', true)
  }

  const data = {
    name: name as string,
    phone: text(formData, 'phone', 40),
    email,
    languages: text(formData, 'languages', 191),
    licenseNumber: text(formData, 'licenseNumber', 80),
    vehicleLabel: text(formData, 'vehicleLabel', 150),
    vehicleSeats,
    isTemporary: formData.get('isTemporary') === 'on',
    notes: text(formData, 'notes', 5000),
  }

  if (id) await prisma.driver.update({ where: { id }, data })
  else await prisma.driver.create({ data })

  refresh()
  back(id ? `Chauffeur « ${data.name} » mis à jour.` : `Chauffeur « ${data.name} » ajouté.`)
}

export async function toggleDriver(formData: FormData) {
  await requireSession()
  const id = text(formData, 'id', 30)
  if (!id) back('Chauffeur introuvable.', true)
  const driver = await prisma.driver.findUnique({ where: { id: id as string } })
  if (!driver) back('Chauffeur introuvable.', true)
  await prisma.driver.update({ where: { id: driver.id }, data: { active: !driver.active } })
  refresh()
  back(`« ${driver.name} » ${driver.active ? 'désactivé' : 'réactivé'}.`)
}

export async function deleteDriver(formData: FormData) {
  const session = await requireSession()
  if ((session.user as { role?: string }).role !== 'SUPER_ADMIN') {
    back('Seul un SUPER_ADMIN peut supprimer un chauffeur. Vous pouvez le désactiver.', true)
  }
  const id = text(formData, 'id', 30)
  if (!id) back('Chauffeur introuvable.', true)
  const assigned = await prisma.quoteRequest.count({ where: { assignedDriverId: id } })
  if (assigned > 0) {
    back(`Ce chauffeur est affecté à ${assigned} voyage(s) : désactivez-le plutôt, pour garder l’historique.`, true)
  }
  await prisma.driver.delete({ where: { id: id as string } })
  refresh()
  back('Chauffeur supprimé.')
}

/** Affecte (ou retire) un chauffeur à une demande depuis sa fiche. */
export async function assignDriver(formData: FormData) {
  await requireSession()
  const quoteId = text(formData, 'quoteId', 30)
  const driverId = text(formData, 'driverId', 30)
  if (!quoteId) throw new Error('Demande introuvable.')
  if (driverId) {
    const driver = await prisma.driver.findUnique({ where: { id: driverId }, select: { id: true } })
    if (!driver) throw new Error('Chauffeur introuvable.')
  }
  await prisma.quoteRequest.update({ where: { id: quoteId }, data: { assignedDriverId: driverId } })
  revalidatePath(`/admin/demandes/${quoteId}`)
  refresh()
  redirect(`/admin/demandes/${quoteId}`)
}
