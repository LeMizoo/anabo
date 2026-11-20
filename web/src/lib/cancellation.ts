/**
 * Règles d'annulation ANABO Roadtrip.
 *
 * 1. Le délai est calculé entre la date d'acceptation du devis par le client
 *    (clientAcceptedAt) et la date de départ souhaitée (acceptedStartDate).
 *    Acceptation à moins de 15 jours calendaires du départ → la réservation ne
 *    peut pas être annulée dans le cadre de la procédure habituelle.
 * 2. Départ anticipé : aucun remboursement des jours non utilisés.
 * 3. La date et l'heure exactes d'acceptation sont conservées (preuve).
 */

export const CANCELLATION_MIN_DAYS = 15

const DAY = 86_400_000

/** Nombre de jours calendaires entre deux dates (comparaison sur les dates UTC, sans l'heure). */
export function calendarDaysBetween(from: Date, to: Date) {
  const a = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  const b = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate())
  return Math.round((b - a) / DAY)
}

export type CancellationStatus = {
  daysBeforeDeparture: number
  cancellable: boolean
}

/**
 * Statut d'annulation selon la date d'acceptation et la date de départ.
 * Retourne null si l'une des deux dates manque.
 */
export function getCancellationStatus(
  acceptedAt: Date | null | undefined,
  departure: Date | null | undefined,
): CancellationStatus | null {
  if (!acceptedAt || !departure) return null
  const daysBeforeDeparture = calendarDaysBetween(acceptedAt, departure)
  return {
    daysBeforeDeparture,
    cancellable: daysBeforeDeparture >= CANCELLATION_MIN_DAYS,
  }
}
