import { createHash } from 'node:crypto'
import { prisma } from '@/lib/prisma'

export type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
}

export function endpointHash(endpoint: string) {
  return createHash('sha256').update(endpoint).digest('hex')
}

export function isPushConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
  )
}

/**
 * Envoie une notification push à tous les appareils des administrateurs abonnés.
 * N'échoue jamais : une erreur d'envoi ne doit pas bloquer l'action en cours.
 * Les abonnements expirés (404/410) sont supprimés automatiquement.
 */
export async function sendPushToAdmins(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (!isPushConfigured()) return { sent: 0, failed: 0 }

  try {
    const webpush = (await import('web-push')).default
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:contact@anabo.mg',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
      process.env.VAPID_PRIVATE_KEY as string,
    )

    const subscriptions = await prisma.adminPushSubscription.findMany()
    const activeAdmins = new Set(
      (await prisma.adminUser.findMany({ where: { active: true, role: { in: ['ADMIN', 'SUPER_ADMIN'] } }, select: { id: true } })).map((u) => u.id),
    )
    let sent = 0
    let failed = 0

    await Promise.all(
      subscriptions
        .filter((sub) => activeAdmins.has(sub.adminUserId))
        .map(async (sub) => {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              JSON.stringify(payload),
              { TTL: 60 * 60 * 12, urgency: 'high' },
            )
            sent++
            await prisma.adminPushSubscription.update({ where: { id: sub.id }, data: { lastUsedAt: new Date() } })
          } catch (error) {
            failed++
            const status = (error as { statusCode?: number }).statusCode
            if (status === 404 || status === 410) {
              await prisma.adminPushSubscription.delete({ where: { id: sub.id } }).catch(() => undefined)
            } else {
              console.error('[push] Envoi impossible :', status || error)
            }
          }
        }),
    )
    return { sent, failed }
  } catch (error) {
    console.error('[push] Notifications indisponibles :', error)
    return { sent: 0, failed: 0 }
  }
}
