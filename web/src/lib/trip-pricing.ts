import { prisma } from '@/lib/prisma'
import type { RoadCondition, TravelSeason } from '@/generated/prisma/enums'
import type { NosyBeOption } from '@/lib/nosy-be-option'

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
  /** Nord et Nosy Be : formule choisie (véhicule embarqué ou standard). */
  nosyBeOption?: NosyBeOption | null
  /** Véhicule embarqué en bac vers Nosy Be : transport à la charge du client, non inclus. */
  vehicleFerryNotIncluded?: boolean
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

/** Règle de retour à vide (base de données, ou valeurs de secours ci-dessous). */
export type EmptyReturnRuleConfig = {
  id: string
  label: string
  days: number
  /** Jours si le véhicule est embarqué (ex. Nosy Be) ; null = option non proposée. */
  ferryDays: number | null
  circuitSlugs: string[]
  regionValues: string[]
  keywords: string[]
}

/**
 * Valeurs de secours, identiques aux règles insérées par la migration 0009.
 * Utilisées uniquement si la table EmptyReturnRule n'existe pas encore.
 */
export const DEFAULT_EMPTY_RETURN_RULES: EmptyReturnRuleConfig[] = [
  {
    id: 'er-sud',
    label: 'Sud – RN7 (Tuléar, Ifaty, Anakao)',
    days: 3,
    ferryDays: null,
    circuitSlugs: ['sud-et-rn7', 'circuit-safari-en-voiture', 'birding-tour'],
    regionValues: ['sud', 'south', 'rn7', 'madagascar-sud-et-rn7', 'circuit-sud-rn7'],
    keywords: ['sud et rn7', 'madagascar sud et rn7', 'circuit sud rn7', 'circuit nature et faune', 'wildlife tour', 'tour naturalistico e fauna', 'birding tour', 'observation des oiseaux', 'birdwatching in madagascar'],
  },
  {
    id: 'er-morondava',
    label: 'Morondava',
    days: 2,
    ferryDays: null,
    circuitSlugs: ['baobab-et-tsingy'],
    regionValues: ['ouest', 'west', 'ovest', 'morondava', 'baobab-tsingy'],
    keywords: ['baobab et tsingy', 'morondava'],
  },
  {
    id: 'er-diego',
    label: 'Diego-Suarez (Antsiranana)',
    days: 3,
    ferryDays: 5,
    circuitSlugs: ['circuit-nord-et-nosibe'],
    regionValues: ['nord', 'north', 'nord-de-madagascar-et-nosy-be', 'diego-suarez', 'nosy-be', 'nosibe'],
    keywords: ['circuit nord et nosibe', 'nord de madagascar et nosy be', 'diego suarez', 'nosy be'],
  },
  {
    id: 'er-toamasina',
    label: 'Toamasina (Tamatave)',
    days: 2,
    ferryDays: null,
    circuitSlugs: ['cote-est-et-lemuriens'],
    regionValues: ['est', 'east', 'cotes-est-et-lemuriens', 'tamatave', 'toamasina'],
    keywords: ['cote est et lemuriens', 'cotes est et lemuriens', 'tamatave', 'toamasina'],
  },
]

export const splitList = (value: string | null | undefined) =>
  (value || '')
    .split(/[,\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean)

/**
 * Règles actives, lues dans Admin > Prix et véhicules > Retours à vide.
 * Repli sur les valeurs de secours si la table n'existe pas encore (migration 0009 non exécutée).
 */
let fallbackWarned = false

export async function getEmptyReturnRules(): Promise<EmptyReturnRuleConfig[]> {
  try {
    const rows = await prisma.emptyReturnRule.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    })
    return rows.map((row) => ({
      id: row.id,
      label: row.label,
      days: row.days,
      ferryDays: row.ferryDays ?? null,
      circuitSlugs: splitList(row.circuitSlugs).map(normalizeSlug),
      regionValues: splitList(row.regionValues).map(normalizeSlug),
      keywords: splitList(row.keywords).map(normalizePhrase),
    }))
  } catch {
    if (!fallbackWarned) {
      fallbackWarned = true
      console.warn('[trip-pricing] Table EmptyReturnRule absente (migration 0009) : règles de retour à vide par défaut utilisées.')
    }
    return DEFAULT_EMPTY_RETURN_RULES
  }
}

export function normalizeSlug(value: string): string {
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
 * Détermine les jours de retour à vide vers Antananarivo :
 * 1. circuit choisi (identifiant stable) ;
 * 2. régions du voyage sur mesure ou circuits passés en régions ;
 * 3. à défaut, mots-clés reconnus dans le titre ou la destination.
 * Si plusieurs règles correspondent, la plus longue s'applique.
 * Option « véhicule embarqué » : jours dédiés de la règle, transport du véhicule en sus.
 */
export function resolveEmptyReturnDays(
  input?: {
    destination?: string | null
    circuitSlug?: string | null
    circuitTitle?: string | null
    regions?: string[] | null
    nosyBeOption?: NosyBeOption | null
  },
  rules: EmptyReturnRuleConfig[] = DEFAULT_EMPTY_RETURN_RULES,
): {
  destinationLabel: string | null
  matchedSlug: string | null
  returnDays: number
  nosyBeOption: NosyBeOption | null
  vehicleFerryNotIncluded: boolean
} {
  let best: EmptyReturnRuleConfig | null = null
  const consider = (rule: EmptyReturnRuleConfig) => {
    if (!best || rule.days > best.days) best = rule
  }

  const slug = input?.circuitSlug ? normalizeSlug(input.circuitSlug) : ''
  if (slug) for (const rule of rules) if (rule.circuitSlugs.includes(slug)) consider(rule)

  const regionSlugs = Array.isArray(input?.regions) ? input.regions.map(normalizeSlug).filter(Boolean) : []
  for (const region of regionSlugs) {
    for (const rule of rules) if (rule.circuitSlugs.includes(region) || rule.regionValues.includes(region)) consider(rule)
  }

  if (!best) {
    const phrases = [input?.circuitTitle || '', input?.destination || ''].map(normalizePhrase).filter(Boolean)
    for (const phrase of phrases) for (const rule of rules) if (rule.keywords.some((k) => k && phrase.includes(k))) consider(rule)
  }

  if (!best) {
    return { destinationLabel: null, matchedSlug: null, returnDays: 0, nosyBeOption: null, vehicleFerryNotIncluded: false }
  }

  const rule = best as EmptyReturnRuleConfig
  const matchedSlug = rule.circuitSlugs[0] || rule.id
  if (rule.ferryDays !== null) {
    if (input?.nosyBeOption === 'ferry') {
      return {
        destinationLabel: `${rule.label} – véhicule embarqué (transport du véhicule en sus)`,
        matchedSlug,
        returnDays: rule.ferryDays,
        nosyBeOption: 'ferry',
        vehicleFerryNotIncluded: true,
      }
    }
    return { destinationLabel: rule.label, matchedSlug, returnDays: rule.days, nosyBeOption: 'diego', vehicleFerryNotIncluded: false }
  }
  return { destinationLabel: rule.label, matchedSlug, returnDays: rule.days, nosyBeOption: null, vehicleFerryNotIncluded: false }
}

/** Informations publiques : où proposer l'option « véhicule embarqué » (aucun prix). */
export async function getVehicleShippingContext(): Promise<{ circuitSlugs: string[]; regionValues: string[] }> {
  const rules = (await getEmptyReturnRules()).filter((rule) => rule.ferryDays !== null)
  return {
    circuitSlugs: [...new Set(rules.flatMap((rule) => rule.circuitSlugs))],
    regionValues: [...new Set(rules.flatMap((rule) => rule.regionValues))],
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
  nosyBeOption?: NosyBeOption | null
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

  const returnInfo = resolveEmptyReturnDays(
    {
      destination: input.destination,
      circuitSlug: input.circuitSlug,
      circuitTitle: input.circuitTitle,
      regions: input.regions,
      nosyBeOption: input.nosyBeOption,
    },
    await getEmptyReturnRules(),
  )

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
      nosyBeOption: returnInfo.nosyBeOption,
      vehicleFerryNotIncluded: returnInfo.vehicleFerryNotIncluded,
      vehicleCost: returnVehicleCost,
      driverCost: returnDriverCost,
      total: returnTotal,
    },
    total,
  }
}