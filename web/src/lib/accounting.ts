import { prisma } from '@/lib/prisma'
import { depositAmount, getPaymentSettings } from '@/lib/payment-settings'
import { parseVehicleEstimateSnapshot } from '@/lib/trip-pricing'

/**
 * Ventilation proposée d'après l'estimation enregistrée avec la demande
 * (location et indemnité, retours à vide compris). null si aucune estimation exploitable.
 */
export function estimateSplit(estimateDetails: string | null): { vehicle: number; driver: number } | null {
  if (!estimateDetails) return null
  let e
  try {
    e = parseVehicleEstimateSnapshot(JSON.parse(estimateDetails))
  } catch {
    return null
  }
  if (!e) return null
  const count = e.vehicleCount || 1
  const rate = typeof e.driverRatePerDay === 'number' ? e.driverRatePerDay : 30
  const vehicleCost = typeof e.vehicleCost === 'number' ? e.vehicleCost : e.pricePerDay * e.days * count
  const driverCost = typeof e.driverCost === 'number' ? e.driverCost : e.days * rate * count
  const returnDays = e.emptyReturn?.returnDays ?? 0
  const returnVehicle = typeof e.emptyReturn?.vehicleCost === 'number' ? e.emptyReturn.vehicleCost : returnDays * e.pricePerDay * count
  const returnDriver = typeof e.emptyReturn?.driverCost === 'number' ? e.emptyReturn.driverCost : returnDays * rate * count
  return { vehicle: Math.round(vehicleCost + returnVehicle), driver: Math.round(driverCost + returnDriver) }
}

/** Ligne comptable d'un voyage confirmé (montants entiers, dans la devise du devis). */
export type AccountingTrip = {
  id: string
  reference: string
  client: string
  circuit: string
  date: Date
  /** true : pas de date de départ, la date affichée est celle de la confirmation */
  dateIsConfirmation: boolean
  currency: string
  total: number | null
  /** Ventilation saisie ; split = false si le total n'est pas ventilé */
  split: boolean
  vehicle: number
  driverPart: number
  other: number
  deposit: number
  depositPaidAt: Date | null
  balance: number
  balancePaidAt: Date | null
  collected: number
  remaining: number
  driverId: string | null
  driverName: string | null
  driverPaidAt: Date | null
  archived: boolean
}

export type CurrencyTotals = {
  currency: string
  trips: number
  total: number
  vehicle: number
  driver: number
  other: number
  unsplit: number
  depositCollected: number
  balanceCollected: number
  collected: number
  remaining: number
  driverPaid: number
  driverDue: number
}
export type MonthRow = { month: number; byCurrency: CurrencyTotals[] }
export type DriverRow = { driverId: string | null; name: string; trips: number; byCurrency: CurrencyTotals[] }

function sumByCurrency(list: AccountingTrip[]): CurrencyTotals[] {
  const map = new Map<string, CurrencyTotals>()
  for (const t of list) {
    if (t.total === null) continue
    const c = map.get(t.currency) || {
      currency: t.currency, trips: 0, total: 0, vehicle: 0, driver: 0, other: 0, unsplit: 0,
      depositCollected: 0, balanceCollected: 0, collected: 0, remaining: 0, driverPaid: 0, driverDue: 0,
    }
    c.trips += 1
    c.total += t.total
    if (t.split) {
      c.vehicle += t.vehicle
      c.driver += t.driverPart
      c.other += t.other
      if (t.driverPaidAt) c.driverPaid += t.driverPart
      else c.driverDue += t.driverPart
    } else {
      c.unsplit += t.total
    }
    if (t.depositPaidAt) c.depositCollected += t.deposit
    if (t.balancePaidAt) c.balanceCollected += t.balance
    c.collected += t.collected
    c.remaining += t.remaining
    map.set(t.currency, c)
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}

/**
 * Voyages confirmés d'une année (date de départ, à défaut date de confirmation),
 * y compris archivés : un voyage terminé reste dans la comptabilité.
 */
export async function getAccounting(year: number) {
  const from = new Date(Date.UTC(year, 0, 1))
  const to = new Date(Date.UTC(year + 1, 0, 1))
  const [settings, quotes, drivers] = await Promise.all([
    getPaymentSettings(),
    prisma.quoteRequest.findMany({
      where: {
        status: 'CONFIRME',
        OR: [
          { startDate: { gte: from, lt: to } },
          { startDate: null, confirmedAt: { gte: from, lt: to } },
        ],
      },
      select: {
        id: true, reference: true, firstName: true, lastName: true, circuitTitle: true, circuitSlug: true,
        startDate: true, confirmedAt: true, createdAt: true, quoteTotalAmount: true, quoteCurrency: true,
        vehicleAmount: true, driverAmount: true, otherAmount: true, driverPaidAt: true, assignedDriverId: true,
        depositPaidAt: true, balancePaidAt: true, archivedAt: true,
      },
    }),
    prisma.driver.findMany({ select: { id: true, name: true } }),
  ])
  const driverName = new Map(drivers.map((d) => [d.id, d.name]))

  const trips: AccountingTrip[] = quotes.map((q) => {
    const total = q.quoteTotalAmount ?? null
    const split = total !== null && (q.vehicleAmount !== null || q.driverAmount !== null || q.otherAmount !== null)
    const deposit = total ? depositAmount(total, settings.depositPercent) ?? 0 : 0
    const balance = total ? Math.max(total - deposit, 0) : 0
    const collected = (q.depositPaidAt ? deposit : 0) + (q.balancePaidAt ? balance : 0)
    return {
      id: q.id,
      reference: q.reference,
      client: `${q.firstName} ${q.lastName}`,
      circuit: q.circuitTitle || q.circuitSlug || 'Voyage sur mesure',
      date: q.startDate ?? q.confirmedAt ?? q.createdAt,
      dateIsConfirmation: !q.startDate,
      currency: (q.quoteCurrency || 'EUR').toUpperCase(),
      total,
      split,
      vehicle: q.vehicleAmount ?? 0,
      driverPart: q.driverAmount ?? 0,
      other: q.otherAmount ?? 0,
      deposit,
      depositPaidAt: q.depositPaidAt,
      balance,
      balancePaidAt: q.balancePaidAt,
      collected,
      remaining: total ? Math.max(total - collected, 0) : 0,
      driverId: q.assignedDriverId,
      driverName: q.assignedDriverId ? driverName.get(q.assignedDriverId) || 'Chauffeur supprimé' : null,
      driverPaidAt: q.driverPaidAt,
      archived: Boolean(q.archivedAt),
    }
  })
  // Ordre chronologique réel (départ, ou confirmation à défaut de date de départ).
  trips.sort((a, b) => a.date.getTime() - b.date.getTime())

  const months: MonthRow[] = Array.from({ length: 12 }, (_, month) => ({
    month,
    byCurrency: sumByCurrency(trips.filter((t) => t.date.getUTCMonth() === month)),
  }))

  // Indemnités par chauffeur (voyages ventilés ayant une indemnité).
  const withAllowance = trips.filter((t) => t.split && t.driverPart > 0)
  const driverKeys = [...new Set(withAllowance.map((t) => t.driverId ?? ''))]
  const driversRows: DriverRow[] = driverKeys
    .map((key) => {
      const list = withAllowance.filter((t) => (t.driverId ?? '') === key)
      return { driverId: key || null, name: key ? list[0].driverName || 'Chauffeur' : 'Chauffeur non affecté', trips: list.length, byCurrency: sumByCurrency(list) }
    })
    .sort((a, b) => (a.driverId === null ? 1 : b.driverId === null ? -1 : a.name.localeCompare(b.name)))

  return {
    year,
    depositPercent: settings.depositPercent,
    trips,
    totals: sumByCurrency(trips),
    months,
    drivers: driversRows,
    missingAmount: trips.filter((t) => t.total === null),
    unsplitTrips: trips.filter((t) => t.total !== null && !t.split),
  }
}

/** Années proposées : de la première demande confirmée à l'année prochaine. */
export async function getAccountingYears() {
  const first = await prisma.quoteRequest.findFirst({
    where: { status: 'CONFIRME' },
    orderBy: [{ startDate: 'asc' }],
    select: { startDate: true, confirmedAt: true },
  })
  const now = new Date().getUTCFullYear()
  const start = Math.min((first?.startDate ?? first?.confirmedAt ?? new Date()).getUTCFullYear(), now)
  return Array.from({ length: now + 1 - start + 1 }, (_, i) => now + 1 - i)
}
