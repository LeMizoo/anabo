'use server'

import { calculateTripVehiclePrice } from '@/lib/trip-pricing'

type CalculateTripVehiclePriceInput = {
  vehicleCode: string
  days: number
  vehicleCount: number
}

export type PublicTripVehicleEstimate = {
  total: number
  currency: string
  indicativeOnly: boolean
  days: number
  vehicleName: string
}

/**
 * Action publique (appelable depuis le navigateur).
 * Ne renvoie que l'estimation finale : le prix journalier, l'identifiant
 * interne et la capacité du véhicule restent côté serveur.
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
    input.vehicleCount > 20
  ) {
    return null
  }

  const result = await calculateTripVehiclePrice({
    vehicleCode: input.vehicleCode,
    days: input.days,
    vehicleCount: input.vehicleCount,
  })

  if (!result) return null

  return {
    total: result.total,
    currency: result.currency,
    indicativeOnly: result.indicativeOnly,
    days: result.days,
    vehicleName: result.vehicleName,
  }
}
