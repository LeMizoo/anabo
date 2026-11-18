import type { Locale } from '@/lib/i18n'
import { sanityClient } from '@/lib/sanity'
import { unstable_noStore as noStore } from 'next/cache'
import { circuitTotalDaysQuery } from '@/lib/queries'

export type VehicleType = '4x4' | 'minivan'

export const VEHICLE_TYPES: VehicleType[] = ['4x4', 'minivan']

export type VehicleRates = {
  fourByFourPerDay: number
  fourByFourModel: string
  miniVanPerDay: number
  miniVanModel: string
}

// Valeurs par défaut, utilisées si la table VehicleRate est vide ou illisible.
export const DEFAULT_VEHICLE_RATES: VehicleRates = {
  fourByFourPerDay: 80,
  fourByFourModel: 'Prado',
  miniVanPerDay: 100,
  miniVanModel: 'Grand Starex',
}

function positiveNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fallback
}

function nonEmptyString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export function resolveVehicleRates(raw?: Partial<VehicleRates> | null): VehicleRates {
  return {
    fourByFourPerDay: positiveNumber(raw?.fourByFourPerDay, DEFAULT_VEHICLE_RATES.fourByFourPerDay),
    fourByFourModel: nonEmptyString(raw?.fourByFourModel, DEFAULT_VEHICLE_RATES.fourByFourModel),
    miniVanPerDay: positiveNumber(raw?.miniVanPerDay, DEFAULT_VEHICLE_RATES.miniVanPerDay),
    miniVanModel: nonEmptyString(raw?.miniVanModel, DEFAULT_VEHICLE_RATES.miniVanModel),
  }
}

// Les tarifs sont modifiés dans /admin/prix et stockés dans Prisma (table VehicleRate).
export async function getVehicleRates(): Promise<VehicleRates> {
  // Les tarifs peuvent changer à tout moment : jamais de page figée au build.
  noStore()

  try {
    const { prisma } = await import('@/lib/prisma')
    const rows = await prisma.vehicleRate.findMany()
    const fourByFour = rows.find((row) => row.vehicleType === '4x4')
    const miniVan = rows.find((row) => row.vehicleType === 'minivan')

    return resolveVehicleRates({
      fourByFourPerDay: fourByFour?.dailyRate,
      fourByFourModel: fourByFour?.modelName,
      miniVanPerDay: miniVan?.dailyRate,
      miniVanModel: miniVan?.modelName,
    })
  } catch (error) {
    console.error('[pricing] Lecture des tarifs impossible, valeurs par défaut utilisées :', error)
    return DEFAULT_VEHICLE_RATES
  }
}

export function dailyRateFor(rates: VehicleRates, vehicle: VehicleType): number {
  return vehicle === '4x4' ? rates.fourByFourPerDay : rates.miniVanPerDay
}

export function modelFor(rates: VehicleRates, vehicle: VehicleType): string {
  return vehicle === '4x4' ? rates.fourByFourModel : rates.miniVanModel
}

export function isValidTotalDays(totalDays: unknown): totalDays is number {
  return typeof totalDays === 'number' && Number.isFinite(totalDays) && totalDays > 0
}

// Prix du circuit pour UN véhicule : nombre total de jours × tarif journalier.
// Il n'existe pas de prix par personne.
export function computeCircuitPrice(totalDays: number, dailyRate: number): number {
  return Math.round(totalDays * dailyRate)
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

export async function getCircuitTotalDays(slug: string, locale: Locale): Promise<number | null> {
  try {
    const totalDays = await sanityClient.fetch<number | null>(
      circuitTotalDaysQuery,
      { slug, locale },
      { cache: 'no-store' },
    )
    return isValidTotalDays(totalDays) ? totalDays : null
  } catch (error) {
    console.error('[pricing] Lecture du nombre de jours impossible :', error)
    return null
  }
}

export type QuoteEstimate = {
  vehicleType: VehicleType
  totalDays: number | null
  dailyRate: number
  estimatedPrice: number | null
}

// Calcul côté serveur : le client n'envoie jamais de prix.
export async function estimateQuote(
  vehicleType: VehicleType,
  circuitSlug: string | null,
  locale: Locale,
): Promise<QuoteEstimate> {
  const [rates, totalDays] = await Promise.all([
    getVehicleRates(),
    circuitSlug ? getCircuitTotalDays(circuitSlug, locale) : Promise.resolve(null),
  ])
  const dailyRate = dailyRateFor(rates, vehicleType)

  return {
    vehicleType,
    totalDays,
    dailyRate: Math.round(dailyRate),
    estimatedPrice: totalDays ? computeCircuitPrice(totalDays, dailyRate) : null,
  }
}
