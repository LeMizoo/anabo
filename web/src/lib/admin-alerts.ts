import { NOT_ARCHIVED } from '@/lib/quote-archive'
import { prisma } from '@/lib/prisma'
import { getCapacityReport } from '@/lib/fleet-capacity'

const DAY = 86_400_000
export const FOLLOW_UP_DAYS = 7

export type AdminAlerts = {
  newRequests: number
  quotesToSend: number
  quotesToFollowUp: number
  capacityIssues: number
  depositsPending: number
  total: number
}

/**
 * Actions à faire par l'équipe :
 * - nouvelles demandes pas encore traitées ;
 * - clients contactés dont le devis n'a pas encore été envoyé ;
 * - devis envoyés depuis plus de 7 jours sans réponse (à relancer).
 */
export async function getAdminAlerts(): Promise<AdminAlerts> {
  const [newRequests, quotesToSend, quotesToFollowUp, capacity, depositsPending] = await Promise.all([
    prisma.quoteRequest.count({ where: { ...NOT_ARCHIVED, status: 'NOUVEAU' } }),
    prisma.quoteRequest.count({ where: { ...NOT_ARCHIVED, status: 'CONTACTE' } }),
    prisma.quoteRequest.count({
      where: { ...NOT_ARCHIVED, status: 'DEVIS_ENVOYE', quoteSentAt: { lt: new Date(Date.now() - FOLLOW_UP_DAYS * DAY) } },
    }),
    getCapacityReport().catch(() => ({ shortages: [], driverConflicts: [] })),
    // Voyages confirmés dont l'acompte n'est pas encore reçu
    prisma.quoteRequest.count({ where: { ...NOT_ARCHIVED, status: 'CONFIRME', depositPaidAt: null } }),
  ])
  // Chevauchements sans assez de véhicules/chauffeurs + doubles affectations d'un chauffeur.
  const capacityIssues = capacity.shortages.length + capacity.driverConflicts.length
  return {
    newRequests,
    quotesToSend,
    quotesToFollowUp,
    capacityIssues,
    depositsPending,
    total: newRequests + quotesToSend + quotesToFollowUp + capacityIssues + depositsPending,
  }
}
