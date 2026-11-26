/**
 * Circuit Nord et Nosy Be : deux formules pour la fin du voyage (validées le 26/11/2026).
 * - 'ferry'  : véhicule et chauffeur embarqués en bac vers Nosy Be (transport du véhicule
 *              Ankify ↔ Nosy Be à la charge du client, en sus), retour à vide de 5 jours.
 * - 'diego'  : formule standard — véhicule et chauffeur sur toute la durée du circuit,
 *              retour à vide de 3 jours depuis Diego-Suarez.
 * Module sans dépendance serveur : utilisable par les formulaires et par le moteur de prix.
 */
export type NosyBeOption = 'ferry' | 'diego'

export const NOSY_BE_DEFAULT_OPTION: NosyBeOption = 'diego'
export const NOSY_BE_FERRY_RETURN_DAYS = 5

export const NORD_CIRCUIT_SLUG = 'circuit-nord-et-nosibe'
export const NORD_VALUES = ['circuit-nord-et-nosibe', 'nord-de-madagascar-et-nosy-be', 'diego-suarez', 'nosy-be', 'nosibe']

export function isNosyBeOption(value: unknown): value is NosyBeOption {
  return value === 'ferry' || value === 'diego'
}

const slugify = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Le voyage passe-t-il par le Nord / Nosy Be (circuit choisi ou régions du sur-mesure) ? */
export function involvesNorth(circuitSlug?: string | null, regions?: string[] | null): boolean {
  const values = [circuitSlug || '', ...(regions || [])].map(slugify).filter(Boolean)
  return values.some((v) => NORD_VALUES.includes(v))
}
