
import { prisma } from '@/lib/prisma'
import type { RoadCondition, TravelSeason } from '@/generated/prisma/enums'

/**
 * Nouveau moteur tarifaire ANABO.
 *
 * Ce module est destiné aux traitements serveur.
 * Ne pas retourner ses instantanés tarifaires privés directement au navigateur.
 */

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

export type TripVehiclePriceSnapshot = {
  vehicleId: string
  vehicleCode: string
  vehicleName: string
  capacity: number
  pricePerDay: number
  currency: string
  indicativeOnly: boolean
  days: number
  vehicleCount: number
  total: number
}

/**
 * Snapshot enregistré en base (QuoteRequest.estimateDetails) et transmis
 * à l'e-mail administrateur. Contient le prix journalier : usage serveur/admin
 * uniquement, jamais renvoyé au navigateur.
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
 * Calcule le prix du véhicule côté serveur.
 *
 * Règle validée :
 * prix journalier × durée × nombre de véhicules demandé.
 *
 * La capacité du véhicule est informative uniquement.
 * Le nombre de véhicules n'est jamais augmenté automatiquement.
 */
export async function calculateTripVehiclePrice(input: {
  vehicleCode: string
  days: number
  vehicleCount: number
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

  const total = vehicle.pricePerDay * input.days * input.vehicleCount

  if (!Number.isSafeInteger(total)) {
    throw new Error('Le montant calculé dépasse la limite autorisée.')
  }

  return {
    vehicleId: vehicle.id,
    vehicleCode: vehicle.code,
    vehicleName: vehicle.name,
    capacity: vehicle.capacity,
    pricePerDay: vehicle.pricePerDay,
    currency: vehicle.currency,
    indicativeOnly: vehicle.indicativeOnly,
    days: input.days,
    vehicleCount: input.vehicleCount,
    total,
  }
}
