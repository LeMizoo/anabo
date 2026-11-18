import { unstable_noStore as noStore } from 'next/cache'
import type { Locale } from '@/lib/i18n'
import { sanityClient } from '@/lib/sanity'
import { circuitKeysBySlugQuery } from '@/lib/queries'
import {
  addRanges,
  isSeason,
  isValidRange,
  priceRange,
  type CircuitDurations,
  type DayRange,
  type Season,
  type Vehicle,
} from '@/lib/trip-pricing'

// Valeurs de secours si la table Vehicle est illisible (base indisponible).
export const DEFAULT_VEHICLES: Vehicle[] = [
  { id: 'veh_4x4', name: '4x4', modelName: 'Prado', seats: 4, dailyRate: 80 },
  { id: 'veh_minivan', name: 'Mini van', modelName: 'Grand Starex', seats: 8, dailyRate: 100 },
]

// Véhicules et tarifs : saisis dans /admin/prix, stockés dans Prisma.
export async function getVehicles(): Promise<Vehicle[]> {
  // Les tarifs peuvent changer à tout moment : jamais de page figée au build.
  noStore()

  try {
    const { prisma } = await import('@/lib/prisma')
    const rows = await prisma.vehicle.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      modelName: row.modelName,
      seats: row.seats,
      dailyRate: row.dailyRate,
    }))
  } catch (error) {
    console.error('[pricing] Lecture des véhicules impossible, valeurs par défaut utilisées :', error)
    return DEFAULT_VEHICLES
  }
}

type DurationRow = {
  circuitKey: string
  dryMin: number | null
  dryMax: number | null
  rainyMin: number | null
  rainyMax: number | null
}

export function rowToDurations(row?: DurationRow | null): CircuitDurations {
  const durations: CircuitDurations = {}
  if (!row) return durations

  const dry = { min: row.dryMin, max: row.dryMax }
  const rainy = { min: row.rainyMin, max: row.rainyMax }
  if (isValidRange(dry)) durations.dry = dry
  if (isValidRange(rainy)) durations.rainy = rainy

  return durations
}

// Durées par circuit (clé = translationGroup Sanity), saisies dans /admin/prix.
export async function getCircuitDurations(): Promise<Record<string, CircuitDurations>> {
  noStore()

  try {
    const { prisma } = await import('@/lib/prisma')
    const rows = await prisma.circuitDuration.findMany()
    return Object.fromEntries(rows.map((row) => [row.circuitKey, rowToDurations(row)]))
  } catch (error) {
    console.error('[pricing] Lecture des durées impossible :', error)
    return {}
  }
}

export type QuoteEstimate = {
  vehicleId: string
  vehicleName: string
  season: Season
  dailyRate: number
  daysMin: number | null
  daysMax: number | null
  priceMin: number | null
  priceMax: number | null
}

type CircuitKeyRow = { slug: string; key: string }

// Estimation côté serveur : le navigateur n'envoie jamais ni durée ni prix, seulement
// le véhicule, la saison et les circuits choisis. Durées cumulées de tous les circuits ;
// aucune durée partielle si un circuit n'a pas de durée pour la saison.
export async function estimateQuote(input: {
  vehicleId: string
  season: unknown
  circuitSlugs: string[]
  locale: Locale
}): Promise<QuoteEstimate | null> {
  if (!isSeason(input.season)) return null

  const vehicles = await getVehicles()
  const vehicle = vehicles.find((item) => item.id === input.vehicleId)
  if (!vehicle) return null

  const estimate: QuoteEstimate = {
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    season: input.season,
    dailyRate: vehicle.dailyRate,
    daysMin: null,
    daysMax: null,
    priceMin: null,
    priceMax: null,
  }

  const slugs = Array.from(new Set(input.circuitSlugs.filter(Boolean)))
  if (slugs.length === 0) return estimate

  try {
    const [rows, durations] = await Promise.all([
      sanityClient.fetch<CircuitKeyRow[]>(circuitKeysBySlugQuery, { slugs }, { cache: 'no-store' }),
      getCircuitDurations(),
    ])

    const keys = slugs.map((slug) => rows.find((row) => row.slug === slug)?.key)
    const ranges: (DayRange | undefined)[] = keys.map((key) =>
      key ? durations[key]?.[input.season as Season] : undefined,
    )
    const { total, unknownCount } = addRanges(ranges)

    if (unknownCount === 0) {
      const price = priceRange(total, vehicle.dailyRate)
      estimate.daysMin = total.min
      estimate.daysMax = total.max
      estimate.priceMin = price.min
      estimate.priceMax = price.max
    }
  } catch (error) {
    console.error('[pricing] Estimation impossible :', error)
  }

  return estimate
}
