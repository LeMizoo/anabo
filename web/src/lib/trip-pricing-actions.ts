'use server'

import { calculateTripVehiclePrice, getPublicVehicleTypes, getVehicleShippingContext } from '@/lib/trip-pricing'
import { getPaymentSettings } from '@/lib/payment-settings'
import { isNosyBeOption, type NosyBeOption, type VehicleShippingContext } from '@/lib/nosy-be-option'

type CalculateTripVehiclePriceInput = {
  vehicleCode: string
  days: number
  vehicleCount: number
  destination?: string | null
  circuitSlug?: string | null
  circuitTitle?: string | null
  regions?: string[] | null
  nosyBeOption?: NosyBeOption | null
}

export type PublicTripVehicleEstimate = {
  total: number
  currency: string
  indicativeOnly: boolean
  days: number
  vehicleName: string
  /** Formule « véhicule embarqué » vers Nosy Be : frais de bac du véhicule en sus. */
  vehicleFerryNotIncluded: boolean
}

/**
 * Action publique (appelable depuis le navigateur).
 * Ne renvoie que l'estimation finale : le prix journalier, l'indemnité chauffeur,
 * le détail du retour à vide, l'identifiant interne et la capacité du véhicule
 * restent côté serveur.
 */
export async function calculateTripVehiclePriceAction(
  input: CalculateTripVehiclePriceInput,
): Promise<PublicTripVehicleEstimate | null> {
  if (
    !input ||
    typeof input.vehicleCode !== 'string' ||
    input.vehicleCode.length > 120 ||
    !Number.isSafeInteger(input.days) ||
    input.days < 1 ||
    input.days > 365 ||
    !Number.isSafeInteger(input.vehicleCount) ||
    input.vehicleCount < 1 ||
    input.vehicleCount > 99
  ) {
    return null
  }

  const safeRegions = Array.isArray(input.regions)
    ? input.regions
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim().slice(0, 120))
        .filter(Boolean)
        .slice(0, 20)
    : null

  const result = await calculateTripVehiclePrice({
    vehicleCode: input.vehicleCode,
    days: input.days,
    vehicleCount: input.vehicleCount,
    destination:
      typeof input.destination === 'string'
        ? input.destination.trim().slice(0, 191) || null
        : null,
    circuitSlug:
      typeof input.circuitSlug === 'string'
        ? input.circuitSlug.trim().slice(0, 191) || null
        : null,
    circuitTitle:
      typeof input.circuitTitle === 'string'
        ? input.circuitTitle.trim().slice(0, 191) || null
        : null,
    regions: safeRegions,
    nosyBeOption: isNosyBeOption(input.nosyBeOption) ? input.nosyBeOption : null,
  })

  if (!result) return null

  return {
    total: result.total,
    currency: result.currency,
    indicativeOnly: result.indicativeOnly,
    days: result.days,
    vehicleName: result.vehicleName,
    vehicleFerryNotIncluded: !!result.emptyReturn.vehicleFerryNotIncluded,
  }
}

export type PublicVehicleOption = { code: string; name: string; capacity: number }

/** Véhicules actifs proposés dans les formulaires (sans aucun prix). */
export async function listPublicVehiclesAction(): Promise<PublicVehicleOption[]> {
  try {
    const vehicles = await getPublicVehicleTypes()
    return vehicles.map((v) => ({ code: v.code, name: v.name, capacity: v.capacity }))
  } catch {
    return []
  }
}

/** Informations publiques sur l'acompte (pourcentage et moyen de paiement). */
export async function getPublicDepositInfoAction(): Promise<{ percent: number; method: string }> {
  const s = await getPaymentSettings()
  return { percent: s.depositPercent, method: s.method }
}
/** Où proposer l'option « véhicule embarqué » (d'après les règles de retour à vide, sans aucun prix). */
export async function getVehicleShippingContextAction(): Promise<VehicleShippingContext> {
  try {
    return await getVehicleShippingContext()
  } catch {
    return { circuitSlugs: [], regionValues: [] }
  }
}
