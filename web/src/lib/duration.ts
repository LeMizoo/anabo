// Calcul de durée des circuits. Fichier sans dépendance serveur : utilisable
// aussi bien dans les composants client (formulaire) que dans l'API.
import type { StopDay } from '@/lib/types'

export type CircuitDurationSource = {
  stopDays?: Pick<StopDay, 'days'>[] | null
  totalDays?: number | null
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

// Durée d'un circuit = somme des jours par escale (stopDays).
// Si aucune escale n'est renseignée, on retombe sur le total saisi (totalDays).
// Jamais calculée à partir de dates saisies par le client.
export function circuitDurationDays(source?: CircuitDurationSource | null): number | null {
  if (!source) return null

  const stopsTotal = (source.stopDays ?? []).reduce(
    (sum, stop) => sum + (isPositiveNumber(stop?.days) ? stop.days : 0),
    0,
  )
  if (stopsTotal > 0) return stopsTotal

  return isPositiveNumber(source.totalDays) ? source.totalDays : null
}

export type CumulatedDuration = {
  // Somme des durées connues.
  totalDays: number
  // Nombre de circuits dont la durée n'est pas renseignée.
  unknownCount: number
}

export function cumulateDurations(durations: (number | null)[]): CumulatedDuration {
  return durations.reduce<CumulatedDuration>(
    (acc, days) =>
      isPositiveNumber(days)
        ? { ...acc, totalDays: acc.totalDays + days }
        : { ...acc, unknownCount: acc.unknownCount + 1 },
    { totalDays: 0, unknownCount: 0 },
  )
}
