'use server'

import { requireStaff } from '@/lib/admin-access'
import { prisma } from '@/lib/prisma'
import { endpointHash, isPushConfigured, sendPushToAdmins } from '@/lib/push'

type BrowserSubscription = {
  endpoint: string
  keys?: { p256dh?: string; auth?: string }
}

async function requireAdmin() {
  return (await requireStaff()).id
}

export async function savePushSubscription(subscription: BrowserSubscription, userAgent?: string) {
  const adminUserId = await requireAdmin()
  const endpoint = String(subscription?.endpoint || '')
  const p256dh = String(subscription?.keys?.p256dh || '')
  const authKey = String(subscription?.keys?.auth || '')

  if (!/^https:\/\//.test(endpoint) || endpoint.length > 2000 || !p256dh || !authKey || p256dh.length > 255 || authKey.length > 255) {
    throw new Error('Abonnement invalide.')
  }

  const hash = endpointHash(endpoint)
  await prisma.adminPushSubscription.upsert({
    where: { endpointHash: hash },
    create: { adminUserId, endpointHash: hash, endpoint, p256dh, auth: authKey, userAgent: userAgent?.slice(0, 255) || null },
    update: { adminUserId, p256dh, auth: authKey, userAgent: userAgent?.slice(0, 255) || null },
  })
  return { success: true }
}

export async function removePushSubscription(endpoint: string) {
  await requireAdmin()
  await prisma.adminPushSubscription.deleteMany({ where: { endpointHash: endpointHash(String(endpoint || '')) } })
  return { success: true }
}

export async function sendTestPush() {
  await requireAdmin()
  if (!isPushConfigured()) {
    return { sent: 0, failed: 0, error: 'Clés VAPID absentes du fichier .env du serveur.' }
  }
  const result = await sendPushToAdmins({
    title: 'ANABO — notification de test',
    body: 'Les notifications fonctionnent sur cet appareil.',
    url: '/admin/dashboard',
    tag: 'test',
  })
  return { ...result, error: null }
}
