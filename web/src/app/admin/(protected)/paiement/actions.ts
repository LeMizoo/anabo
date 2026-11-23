'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function back(message: string, isError = false): never {
  redirect(`/admin/paiement?${isError ? 'erreur' : 'ok'}=${encodeURIComponent(message)}`)
}

/** Paramètres de paiement de l'acompte : réservé au SUPER_ADMIN. */
export async function savePaymentSettings(formData: FormData) {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'SUPER_ADMIN') {
    back('Seul un SUPER_ADMIN peut modifier les paramètres de paiement.', true)
  }

  const text = (key: string, max: number) => String(formData.get(key) || '').trim().slice(0, max)
  const method = text('method', 80)
  const phoneNumber = text('phoneNumber', 40)
  const accountHolder = text('accountHolder', 150) || null
  const instructions = text('instructions', 2000) || null
  const depositPercent = Number(formData.get('depositPercent'))

  if (!method) back('Le moyen de paiement est obligatoire.', true)
  if (!/^\+?[\d\s().-]{6,40}$/.test(phoneNumber)) back('Numéro de paiement invalide.', true)
  if (!Number.isInteger(depositPercent) || depositPercent < 0 || depositPercent > 100) {
    back('Le pourcentage d’acompte doit être un nombre entier entre 0 et 100.', true)
  }

  const data = { method, phoneNumber, accountHolder, depositPercent, instructions, updatedBy: session?.user?.email || null }
  await prisma.paymentSettings.upsert({ where: { id: 'default' }, create: { id: 'default', ...data }, update: data })

  // Les pages publiques qui affichent l'acompte
  revalidatePath('/admin/paiement')
  for (const locale of ['fr', 'en', 'it']) revalidatePath(`/${locale}/annulation`)
  back('Paramètres de paiement enregistrés.')
}
