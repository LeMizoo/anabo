import { prisma } from '@/lib/prisma'

export type QuoteEstimateSnapshot = {
  version: 1 | 2
  calculatedAt: string
  circuitSlug: string
  pricingMode?: 'DAILY_CAR' | 'TOUR_INCLUDED'
  adults: number
  children: number
  people: number
  days: number
  consecutiveCircuits: number
  vehicleCount: number
  currency: string
  basePricePerPerson: number
  baseTotal: number
  vehicle?: {
    code: string
    matchedOptionCode: string
    label: string
    capacity: number
    pricePerDay: number
    vehiclesCharged: number
    total: number
    indicativeOnly: boolean
  }
  package?: {
    id: string
    name: string
    items: { code: string; name: string; unit: string; unitPrice: number; quantity: number; total: number }[]
    total: number
  }
  subtotal: number
  discounts: {
    multiplex: { percentage: number; amount: number }
    fleet: { percentage: number; amount: number }
    total: number
  }
  finalPrice: number
}

export type PublicQuoteEstimate = Pick<QuoteEstimateSnapshot, 'finalPrice' | 'currency'> & {
  discounts: { multiplex: number; fleet: number }
  indicativeVehicle: boolean
}

export async function calculateQuoteEstimate(input: {
  circuitSlug: string
  pricingMode: 'DAILY_CAR' | 'TOUR_INCLUDED'
  vehicleCode?: string
  vehicleLabel?: string
  packageId?: string
  adults: number
  children: number
  days: number
  consecutiveCircuits: number
  vehicleCount: number
}): Promise<{ snapshot: QuoteEstimateSnapshot; publicEstimate: PublicQuoteEstimate } | null> {
  const people = input.adults + input.children
  const config = await prisma.pricingConfig.findUnique({
    where: { circuitSlug: input.circuitSlug },
    include: { vehicles: true },
  })
  if (!config) return null

  let vehicle: (typeof config.vehicles)[number] | undefined
  if (input.vehicleCode) {
    vehicle = config.vehicles.find((item) => item.code === input.vehicleCode || (item.aliases || '').split(/\r?\n/).some((alias) => alias.trim() === input.vehicleCode))
    if (!vehicle) return null
  }
  if (input.pricingMode === 'DAILY_CAR' && (!config.dailyCarEnabled || !vehicle || vehicle.pricePerDay <= 0 || input.days < 1)) return null
  if (input.pricingMode === 'TOUR_INCLUDED' && (!config.tourPriceEnabled || config.tourPrice === null || config.tourPrice <= 0)) return null

  const selectedPackage = input.packageId
    ? await prisma.pricingPackage.findFirst({
        where: { id: input.packageId, configId: config.id, active: true, OR: [{ scope: input.pricingMode }, { scope: 'BOTH' }] },
      include: { items: true },
    })
    : null
  if (input.packageId && !selectedPackage) return null
  if (input.days < 1 && selectedPackage?.items.some((item) => item.unit === 'PER_DAY')) return null

  const items = (selectedPackage?.items || []).map((item) => {
    const quantity = item.unit === 'PER_PERSON' ? people
      : item.unit === 'PER_DAY' ? input.days
        : item.unit === 'PER_VEHICLE' ? input.vehicleCount : 1
    return { code: item.code, name: item.name, unit: item.unit, unitPrice: item.price, quantity, total: item.price * quantity }
  })
  const packageTotal = items.reduce((total, item) => total + item.total, 0)
  const baseTotal = input.pricingMode === 'TOUR_INCLUDED' ? config.tourPrice || 0 : 0
  const vehiclesCharged = input.pricingMode === 'DAILY_CAR' && vehicle
    ? Math.max(input.vehicleCount, Math.ceil(people / vehicle.capacity))
    : 0
  const vehicleTotal = vehicle && input.pricingMode === 'DAILY_CAR'
    ? vehicle.pricePerDay * input.days * vehiclesCharged
    : 0
  const subtotal = baseTotal + vehicleTotal + packageTotal

  const applicableRules = await prisma.pricingRule.findMany({
    where: {
      active: true,
      OR: [
        { kind: 'MULTIPLEX', threshold: { lte: input.consecutiveCircuits } },
        { kind: 'FLOTTE', threshold: { lte: input.vehicleCount } },
      ],
    },
    orderBy: [{ threshold: 'desc' }, { percentage: 'desc' }],
  })
  const multiplexRule = applicableRules.find((rule) => rule.kind === 'MULTIPLEX')
  const fleetRule = applicableRules.find((rule) => rule.kind === 'FLOTTE')
  const multiplexAmount = multiplexRule ? Math.round(subtotal * multiplexRule.percentage / 100) : 0
  const afterMultiplex = subtotal - multiplexAmount
  const fleetAmount = fleetRule ? Math.round(afterMultiplex * fleetRule.percentage / 100) : 0
  const finalPrice = Math.max(0, afterMultiplex - fleetAmount)

  const snapshot: QuoteEstimateSnapshot = {
    version: 2,
    calculatedAt: new Date().toISOString(),
    circuitSlug: input.circuitSlug,
    pricingMode: input.pricingMode,
    adults: input.adults,
    children: input.children,
    people,
    days: input.days,
    consecutiveCircuits: input.consecutiveCircuits,
    vehicleCount: input.vehicleCount,
    currency: config.currency,
    basePricePerPerson: 0,
    baseTotal,
    ...(vehicle ? {
      vehicle: {
        code: vehicle.code,
        matchedOptionCode: input.vehicleCode || vehicle.code,
        label: input.vehicleLabel || vehicle.name,
        capacity: vehicle.capacity,
        pricePerDay: vehicle.pricePerDay,
        vehiclesCharged,
        total: vehicleTotal,
        indicativeOnly: vehicle.indicativeOnly,
      },
    } : {}),
    ...(selectedPackage ? { package: { id: selectedPackage.id, name: selectedPackage.name, items, total: packageTotal } } : {}),
    subtotal,
    discounts: {
      multiplex: { percentage: multiplexRule?.percentage || 0, amount: multiplexAmount },
      fleet: { percentage: fleetRule?.percentage || 0, amount: fleetAmount },
      total: multiplexAmount + fleetAmount,
    },
    finalPrice,
  }

  return {
    snapshot,
    publicEstimate: {
      finalPrice,
      currency: config.currency,
      discounts: {
        multiplex: snapshot.discounts.multiplex.percentage,
        fleet: snapshot.discounts.fleet.percentage,
      },
      indicativeVehicle: input.pricingMode === 'DAILY_CAR' && (vehicle?.indicativeOnly || false),
    },
  }
}
