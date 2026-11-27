// Durées indicatives d'un voyage composé d'un ou plusieurs circuits.
// Module pur (sans base de données) : utilisé à l'identique par les formulaires et par le serveur,
// pour que le montant affiché au client soit exactement celui enregistré avec sa demande.

export type Season = 'DRY' | 'RAINY'

export type DurationRow = {
  circuitSlug: string
  season: Season
  roadCondition: 'GOOD' | 'MEDIUM' | 'DIFFICULT'
  minDays: number
  maxDays: number
}

export type CircuitDurationRange = {
  /** Durée de référence (montant exact affiché) = somme des durées minimales */
  minDays: number
  maxDays: number
  perCircuit: { circuitSlug: string; minDays: number; maxDays: number }[]
  /** Circuits sans durée configurée (non comptés) */
  missing: string[]
  /** Saison prise en compte ; null = toutes saisons (date de départ inconnue) */
  season: Season | null
}

/** Saison sèche de mai à octobre, saison des pluies de novembre à avril (date « AAAA-MM-JJ » ou Date). */
export function seasonOf(date: string | Date | null | undefined): Season | null {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(`${date.slice(0, 10)}T00:00:00Z`) : date
  if (Number.isNaN(d.getTime())) return null
  const month = d.getUTCMonth() + 1
  return month >= 5 && month <= 10 ? 'DRY' : 'RAINY'
}

/**
 * Cumul des durées des circuits choisis : pour chaque circuit, durée la plus courte et la plus longue
 * (sur la saison connue, sinon sur toute l'année, tous états de route confondus), additionnées.
 */
export function circuitDurationRange(rows: DurationRow[], slugs: string[], season: Season | null): CircuitDurationRange | null {
  const unique = [...new Set(slugs.map((s) => s.trim().toLowerCase()).filter(Boolean))]
  const perCircuit: CircuitDurationRange['perCircuit'] = []
  const missing: string[] = []
  for (const slug of unique) {
    const matching = rows.filter((r) => r.circuitSlug === slug && (!season || r.season === season))
    if (matching.length === 0) {
      missing.push(slug)
      continue
    }
    perCircuit.push({
      circuitSlug: slug,
      minDays: Math.min(...matching.map((r) => r.minDays)),
      maxDays: Math.max(...matching.map((r) => r.maxDays)),
    })
  }
  if (perCircuit.length === 0) return null
  return {
    minDays: perCircuit.reduce((n, c) => n + c.minDays, 0),
    maxDays: perCircuit.reduce((n, c) => n + c.maxDays, 0),
    perCircuit,
    missing,
    season,
  }
}
