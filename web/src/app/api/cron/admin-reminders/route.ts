import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getAdminAlerts } from '@/lib/admin-alerts'
import { sendPushToAdmins } from '@/lib/push'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function validKey(given: string | null) {
  const expected = process.env.CRON_SECRET || ''
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Rappel des actions à faire, envoyé en notification push aux admins.
 * Appelé par une tâche planifiée cPanel (Cron Jobs), par exemple :
 *   curl -s "https://roadtrip.anabo.mg/api/cron/admin-reminders?key=CRON_SECRET"
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const key = url.searchParams.get('key') || request.headers.get('x-cron-key')
  if (!validKey(key)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const alerts = await getAdminAlerts()
  if (alerts.total === 0) return NextResponse.json({ sent: 0, alerts })

  const parts = [
    alerts.newRequests && `${alerts.newRequests} nouvelle(s) demande(s)`,
    alerts.quotesToSend && `${alerts.quotesToSend} devis à envoyer`,
    alerts.quotesToFollowUp && `${alerts.quotesToFollowUp} devis à relancer`,
  ].filter(Boolean)

  const result = await sendPushToAdmins({
    title: `ANABO : ${alerts.total} action(s) à faire`,
    body: parts.join(' · '),
    url: alerts.quotesToSend ? '/admin/demandes?status=CONTACTE' : alerts.newRequests ? '/admin/demandes?status=NOUVEAU' : '/admin/demandes?suivi=relance',
    tag: 'daily-reminder',
  })

  return NextResponse.json({ ...result, alerts })
}
