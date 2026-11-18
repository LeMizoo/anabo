// Calculs de durée et de prix. Fichier SANS dépendance serveur : utilisable dans les
// composants client (formulaire de devis) comme côté serveur (API, pages).
// Tout le prix vient de /admin/prix : véhicules (prix/jour) et circuits (durée par saison).
import type { Locale } from '@/lib/i18n'

export type Season = 'dry' | 'rainy'

export const SEASONS: Season[] = ['dry', 'rainy']

// Fourchette approximative de jours, selon la qualité des routes.
export type DayRange = { min: number; max: number }

export type CircuitDurations = Partial<Record<Season, DayRange>>

export type Vehicle = {
  id: string
  name: string
  modelName: string
  seats: number
  dailyRate: number
}

export function isSeason(value: unknown): value is Season {
  return value === 'dry' || value === 'rainy'
}

export function isValidRange(range: unknown): range is DayRange {
  if (typeof range !== 'object' || range === null) return false
  const { min, max } = range as Partial<DayRange>
  return (
    typeof min === 'number' &&
    typeof max === 'number' &&
    Number.isInteger(min) &&
    Number.isInteger(max) &&
    min > 0 &&
    max >= min
  )
}

export type CumulatedRange = {
  // Somme des fourchettes connues.
  total: DayRange
  // Nombre de circuits sans durée renseignée pour la saison choisie.
  unknownCount: number
}

export function addRanges(ranges: (DayRange | null | undefined)[]): CumulatedRange {
  return ranges.reduce<CumulatedRange>(
    (acc, range) =>
      isValidRange(range)
        ? {
            ...acc,
            total: { min: acc.total.min + range.min, max: acc.total.max + range.max },
          }
        : { ...acc, unknownCount: acc.unknownCount + 1 },
    { total: { min: 0, max: 0 }, unknownCount: 0 },
  )
}

// Prix pour UN véhicule : nombre de jours × tarif journalier. Pas de prix par personne.
export function priceRange(days: DayRange, dailyRate: number): DayRange {
  return {
    min: Math.round(days.min * dailyRate),
    max: Math.round(days.max * dailyRate),
  }
}

// Plus petite et plus grande durée toutes saisons confondues (pour les cartes).
export function overallRange(durations?: CircuitDurations | null): DayRange | null {
  const ranges = SEASONS.map((season) => durations?.[season]).filter(isValidRange)
  if (ranges.length === 0) return null
  return {
    min: Math.min(...ranges.map((range) => range.min)),
    max: Math.max(...ranges.map((range) => range.max)),
  }
}

const intlLocale: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  it: 'it-IT',
}

export function formatEuro(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatEuroRange(range: DayRange, locale: Locale): string {
  return range.min === range.max
    ? formatEuro(range.min, locale)
    : `${formatEuro(range.min, locale)} – ${formatEuro(range.max, locale)}`
}

type DaysTranslator = (key: 'days' | 'daysRange', values: { count?: number; min?: number; max?: number }) => string

// « 8 jours » ou « 8–10 jours » selon la fourchette.
export function formatDays(range: DayRange, t: DaysTranslator): string {
  return range.min === range.max
    ? t('days', { count: range.min })
    : t('daysRange', { min: range.min, max: range.max })
}
