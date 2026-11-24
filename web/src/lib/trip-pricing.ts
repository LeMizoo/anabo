import { prisma } from '@/lib/prisma'
import type { RoadCondition, TravelSeason } from '@/generated/prisma/enums'

/**
 * Nouveau moteur tarifaire ANABO.
 *
 * Ce module est destiné aux traitements serveur.
 * Ne pas retourner ses instantanés tarifaires privés directement au navigateur.
 */

export const DRIVER_DAILY_RATE_EUR = 30

export type TripSeason = TravelSeason
export type TripRoadCondition = RoadCondition

export type PublicVehicleType = {
  id: string
  code: string
  name: string
  capacity: number
  currency: string
  indicativeOnly: boolean
}

export type TripDurationEstimate = {
  circuitSlug: string
  season: TripSeason
  roadCondition: TripRoadCondition
  minDays: number
  maxDays: number
}

export type EmptyReturnBreakdown = {
  destinationLabel: string | null
  matchedSlug: string | null
  returnDays: number
  vehicleCost: number
  driverCost: number
  total: number
}

export type TripVehiclePriceSnapshot = {
  vehicleId: string
  vehicleCode: string
  vehicleName: string
  capacity: number
  pricePerDay: number
  driverRatePerDay: number
  currency: string
  indicativeOnly: boolean
  days: number
  vehicleCount: number
  vehicleCost: number
  driverCost: number
  emptyReturn: EmptyReturnBreakdown
  total: number
}

/**
 * Snapshot enregistré en base (QuoteRequest.estimateDetails) et transmis
 * à l'e-mail administrateur. Contient le prix journalier et le détail des postes :
 * usage serveur/admin uniquement, jamais renvoyé au navigateur.
 */
export type VehicleEstimateSnapshot = TripVehiclePriceSnapshot & {
  version: 3
  calculatedAt: string
}

export function parseVehicleEstimateSnapshot(
  value: unknown,
): VehicleEstimateSnapshot | null {
  if (!value || typeof value !== 'object') return null

  const parsed = value as Partial<VehicleEstimateSnapshot>

  return parsed.version === 3 &&
    typeof parsed.total === 'number' &&
    typeof parsed.pricePerDay === 'number' &&
    typeof parsed.currency === 'string' &&
    typeof parsed.days === 'number'
    ? (parsed as VehicleEstimateSnapshot)
    : null
}

type EmptyReturnRule = {
  slug: string
  label: string
  days: number
  regionValues: string[]
  fallbackPhrases: string[]
}

const EMPTY_RETURN_RULES: EmptyReturnRule[] = [
  {
    slug: 'sud-et-rn7',
    label: 'Circuit Sud RN7',
    days: 3,
    regionValues: [
      'sud-et-rn7',
      'madagascar-sud-et-rn7',
      'circuit-sud-rn7',
      'rn7',
    ],
    fallbackPhrases: [
      'sud et rn7',
      'madagascar sud et rn7',
      'circuit sud rn7',
    ],
  },
  {
    slug: 'circuit-nord-et-nosibe',
    label: 'Diego-Suarez',
    days: 3,
    regionValues: [
      'circuit-nord-et-nosibe',
      'nord-de-madagascar-et-nosy-be',
      'diego-suarez',
      'nosy-be',
      'nosibe',
    ],
    fallbackPhrases: [
      'circuit nord et nosibe',
      'nord de madagascar et nosy be',
      'diego suarez',
      'nosy be',
    ],
  },
  {
    slug: 'baobab-et-tsingy',
    label: 'Morondava',
    days: 2,
    regionValues: [
      'baobab-et-tsingy',
      'morondava',
      'baobab-tsingy',
    ],
    fallbackPhrases: [
      'baobab et tsingy',
      'morondava',
    ],
  },
  {
    slug: 'cote-est-et-lemuriens',
    label: 'Tamatave (Toamasina)',
    days: 2,
    regionValues: [
      'cote-est-et-lemuriens',
      'cotes-est-et-lemuriens',
      'tamatave',
      'toamasina',
    ],
    fallbackPhrases: [
      'cote est et lemuriens',
      'cotes est et lemuriens',
      'tamatave',
      'toamasina',
    ],
  },
]

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizePhrase(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Détermine les jours de retour à vide vers Antananarivo en priorité à partir
 * des identifiants stables (circuitSlug, puis valeurs de regions), avec repli
 * uniquement sur des expressions normalisées explicites.
 */
export function resolveEmptyReturnDays(input?: {
  destination?: string | null
  circuitSlug?: string | null
  circuitTitle?: string | null
  regions?: string[] | null
}): {
  destinationLabel: string | null
  matchedSlug: string | null
  returnDays: number
} {
  let bestRule: EmptyReturnRule | null = null

  const considerRule = (rule: EmptyReturnRule) => {
    if (!bestRule || rule.days > bestRule.days) {
      bestRule = rule
    }
  }

  // 1. Priorité absolue : identifiant stable du circuit (slug)
  const rawSlug = input?.circuitSlug ? normalizeSlug(input.circuitSlug) : ''
  if (rawSlug) {
    const bySlug = EMPTY_RETURN_RULES.find((r) => r.slug === rawSlug)
    if (bySlug) {
      considerRule(bySlug)
    }
  }

  // 2. Deuxième priorité : identifiants/valeurs des régions sélectionnées
  const regionSlugs = Array.isArray(input?.regions)
    ? input.regions.map(normalizeSlug).filter(Boolean)
    : []

  for (const regionSlug of regionSlugs) {
    const byRegion = EMPTY_RETURN_RULES.find(
      (r) => r.slug === regionSlug || r.regionValues.includes(regionSlug),
    )
    if (byRegion) {
      considerRule(byRegion)
    }
  }

  // 3. Repli uniquement si aucun identifiant stable n'a matché : expressions explicites
  if (!bestRule) {
    const fallbackTexts = [
      input?.circuitTitle || '',
      input?.destination || '',
    ]
      .map(normalizePhrase)
      .filter(Boolean)

    for (const phrase of fallbackTexts) {
      for (const rule of EMPTY_RETURN_RULES) {
        if (rule.fallbackPhrases.some((target) => phrase.includes(target))) {
          considerRule(rule)
        }
      }
    }
  }

  if (!bestRule) {
    return {
      destinationLabel: null,
      matchedSlug: null,
      returnDays: 0,
    }
  }

  const resolvedRule = bestRule as EmptyReturnRule

  return {
    destinationLabel: resolvedRule.label,
    matchedSlug: resolvedRule.slug,
    returnDays: resolvedRule.days,
  }
}

/**
 * Détermine la saison à partir de la date de départ.
 * DRY : mai à octobre.
 * RAINY : novembre à avril.
 *
 * Pour une date au format YYYY-MM-DD, le mois est lu directement
 * afin d'éviter les décalages de fuseau horaire.
 */
export function getTripSeason(departureDate: Date | string): TripSeason {
  let month: number

  if (typeof departureDate === 'string') {
    const match = departureDate.match(/^\d{4}-(\d{2})-\d{2}$/)

    if (!match) {
      throw new Error('Date de départ invalide.')
    }

    month = Number(match[1])
  } else {
    if (Number.isNaN(departureDate.getTime())) {
      throw new Error('Date de départ invalide.')
    }

    month = departureDate.getUTCMonth() + 1
  }

  if (month < 1 || month > 12) {
    throw new Error('Date de départ invalide.')
  }

  return month >= 5 && month <= 10 ? 'DRY' : 'RAINY'
}

/**
 * Retourne les véhicules actifs avec uniquement les informations
 * autorisées pour l'affichage public.
 *
 * Le prix journalier n'est volontairement pas sélectionné.
 */
export async function getPublicVehicleTypes(): Promise<PublicVehicleType[]> {
  return prisma.vehicleType.findMany({
    where: { active: true },
    select: {
      id: true,
      code: true,
      name: true,
      capacity: true,
      currency: true,
      indicativeOnly: true,
    },
    orderBy: { name: 'asc' },
  })
}

/**
 * Récupère la fourchette indicative d'un circuit selon :
 * - la date de départ ;
 * - la saison calculée automatiquement ;
 * - l'état des routes choisi par l'administrateur.
 *
 * Retourne null si cette combinaison n'est pas configurée.
 */
export async function getTripDurationEstimate(input: {
  circuitSlug: string
  departureDate: Date | string
  roadCondition: TripRoadCondition
}): Promise<TripDurationEstimate | null> {
  const circuitSlug = input.circuitSlug.trim().toLowerCase()

  if (!/^[a-z0-9-]{1,191}$/.test(circuitSlug)) {
    throw new Error('Circuit invalide.')
  }

  const season = getTripSeason(input.departureDate)

  const duration = await prisma.circuitDuration.findUnique({
    where: {
      circuitSlug_season_roadCondition: {
        circuitSlug,
        season,
        roadCondition: input.roadCondition,
      },
    },
    select: {
      minDays: true,
      maxDays: true,
    },
  })

  if (!duration) return null

  return {
    circuitSlug,
    season,
    roadCondition: input.roadCondition,
    minDays: duration.minDays,
    maxDays: duration.maxDays,
  }
}

/**
 * Calcule le prix complet côté serveur :
 * - vehicleCost = days * pricePerDay * vehicleCount
 * - driverCost = days * 30 * vehicleCount
 * - returnCost = (returnDays * pricePerDay + returnDays * 30) * vehicleCount
 * - total = vehicleCost + driverCost + returnCost
 *
 * La capacité du véhicule est informative uniquement.
 * Le nombre de véhicules n'est jamais augmenté automatiquement.
 */
export async function calculateTripVehiclePrice(input: {
  vehicleCode: string
  days: number
  vehicleCount: number
  destination?: string | null
  circuitSlug?: string | null
  circuitTitle?: string | null
  regions?: string[] | null
}): Promise<TripVehiclePriceSnapshot | null> {
  const vehicleCode = input.vehicleCode.trim().toLowerCase()

  if (!vehicleCode) return null

  if (!Number.isSafeInteger(input.days) || input.days < 1 || input.days > 365) {
    throw new Error('Durée du voyage invalide.')
  }

  if (
    !Number.isSafeInteger(input.vehicleCount) ||
    input.vehicleCount < 1 ||
    input.vehicleCount > 100
  ) {
    throw new Error('Nombre de véhicules invalide.')
  }

  const vehicle = await prisma.vehicleType.findFirst({
    where: {
      code: vehicleCode,
      active: true,
    },
    select: {
      id: true,
      code: true,
      name: true,
      capacity: true,
      pricePerDay: true,
      currency: true,
      indicativeOnly: true,
    },
  })

  if (!vehicle) return null

  if (!Number.isSafeInteger(vehicle.pricePerDay) || vehicle.pricePerDay <= 0) {
    return null
  }

  const returnInfo = resolveEmptyReturnDays({
    destination: input.destination,
    circuitSlug: input.circuitSlug,
    circuitTitle: input.circuitTitle,
    regions: input.regions,
  })

  const vehicleCost = input.days * vehicle.pricePerDay * input.vehicleCount
  const driverCost = input.days * DRIVER_DAILY_RATE_EUR * input.vehicleCount

  const returnVehicleCost =
    returnInfo.returnDays * vehicle.pricePerDay * input.vehicleCount
  const returnDriverCost =
    returnInfo.returnDays * DRIVER_DAILY_RATE_EUR * input.vehicleCount
  const returnTotal = returnVehicleCost + returnDriverCost

  const total = vehicleCost + driverCost + returnTotal

  if (
    !Number.isSafeInteger(vehicleCost) ||
    !Number.isSafeInteger(driverCost) ||
    !Number.isSafeInteger(returnVehicleCost) ||
    !Number.isSafeInteger(returnDriverCost) ||
    !Number.isSafeInteger(returnTotal) ||
    !Number.isSafeInteger(total)
  ) {
    throw new Error('Le montant calculé dépasse la limite autorisée.')
  }

  return {
    vehicleId: vehicle.id,
    vehicleCode: vehicle.code,
    vehicleName: vehicle.name,
    capacity: vehicle.capacity,
    pricePerDay: vehicle.pricePerDay,
    driverRatePerDay: DRIVER_DAILY_RATE_EUR,
    currency: vehicle.currency,
    indicativeOnly: vehicle.indicativeOnly,
    days: input.days,
    vehicleCount: input.vehicleCount,
    vehicleCost,
    driverCost,
    emptyReturn: {
      destinationLabel: returnInfo.destinationLabel,
      matchedSlug: returnInfo.matchedSlug,
      returnDays: returnInfo.returnDays,
      vehicleCost: returnVehicleCost,
      driverCost: returnDriverCost,
      total: returnTotal,
    },
    total,
  }
}