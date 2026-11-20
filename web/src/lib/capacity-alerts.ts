import { shortageForTrip } from '@/lib/fleet-capacity'
import { sendPushToAdmins } from '@/lib/push'

/**
 * Prévient les admins (push) si un voyage confirmé crée un manque
 * de véhicules/chauffeurs. N'échoue jamais.
 */
export async function notifyIfShortage(quoteId: string) {
  try {
    const shortage = await shortageForTrip(quoteId)
    if (!shortage) return
    const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', timeZone: 'UTC' })
    await sendPushToAdmins({
      title: `Voyages qui se chevauchent (${fmt(shortage.start)} → ${fmt(shortage.end)})`,
      body: `${shortage.trips.length} voyages confirmés, ${shortage.required} véhicule(s) nécessaires pour ${shortage.capacity} disponible(s). Ajoutez ${shortage.missing} véhicule(s)/chauffeur(s) en renfort.`,
      url: '/admin/planning',
      tag: `shortage-${shortage.start.toISOString().slice(0, 10)}`,
    })
  } catch (error) {
    console.error('[capacité] Vérification impossible :', error)
  }
}
