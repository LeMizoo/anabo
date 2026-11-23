import { prisma } from '@/lib/prisma'

const DAY = 86_400_000

export type CapacityTrip = {
  id: string
  reference: string
  client: string
  start: Date
  end: Date
  vehicles: number
  assignedDriverId: string | null
}

export type Shortage = {
  start: Date
  end: Date
  required: number
  capacity: number
  missing: number
  trips: { id: string; reference: string; client: string }[]
}

export type DriverConflict = {
  driverId: string
  driverName: string
  references: string[]
}

export type CapacityReport = {
  capacity: number
  activeDrivers: number
  shortages: Shortage[]
  driverConflicts: DriverConflict[]
}

const utcDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())

export function tripEnd(start: Date, end: Date | null, duration: number | null) {
  if (end && end >= start) return end
  if (duration && duration > 0) return new Date(start.getTime() + (duration - 1) * DAY)
  return start
}

/**
 * Jour par jour, compare les véhicules nécessaires aux voyages confirmés
 * avec la capacité (chauffeurs actifs ; 1 au minimum).
 * Regroupe les jours consécutifs en périodes de manque.
 */
export function computeShortages(trips: CapacityTrip[], capacity: number): Shortage[] {
  if (trips.length < 2 && trips.every((t) => t.vehicles <= capacity)) return []
  const first = Math.min(...trips.map((t) => utcDay(t.start)))
  const last = Math.max(...trips.map((t) => utcDay(t.end)))
  const shortages: Shortage[] = []
  let current: Shortage | null = null

  for (let day = first; day <= last && day - first < 800 * DAY; day += DAY) {
    const active = trips.filter((t) => utcDay(t.start) <= day && day <= utcDay(t.end))
    const required = active.reduce((sum, t) => sum + Math.max(1, t.vehicles), 0)
    if (required > capacity && active.length > 0) {
      const ids = active.map((t) => t.id).sort().join(',')
      if (current && current.trips.map((t) => t.id).sort().join(',') === ids && current.end.getTime() === day - DAY) {
        current.end = new Date(day)
        current.required = Math.max(current.required, required)
        current.missing = current.required - capacity
      } else {
        current = {
          start: new Date(day),
          end: new Date(day),
          required,
          capacity,
          missing: required - capacity,
          trips: active.map((t) => ({ id: t.id, reference: t.reference, client: t.client })),
        }
        shortages.push(current)
      }
    } else {
      current = null
    }
  }
  return shortages
}

/** Rapport complet pour les voyages confirmés à venir (ou en cours). */
export async function getCapacityReport(): Promise<CapacityReport> {
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z')
  const [quotes, drivers] = await Promise.all([
    prisma.quoteRequest.findMany({
      where: { status: 'CONFIRME', startDate: { not: null } },
      select: {
        id: true, reference: true, firstName: true, lastName: true, startDate: true, endDate: true,
        selectedDurationDays: true, vehicleCount: true, assignedDriverId: true,
      },
    }),
    prisma.driver.findMany({ where: { active: true }, select: { id: true, name: true } }),
  ])

  const trips: CapacityTrip[] = quotes
    .map((q) => {
      const start = q.startDate as Date
      return {
        id: q.id,
        reference: q.reference,
        client: `${q.firstName} ${q.lastName}`,
        start,
        end: tripEnd(start, q.endDate, q.selectedDurationDays),
        vehicles: q.vehicleCount || 1,
        assignedDriverId: q.assignedDriverId,
      }
    })
    .filter((t) => t.end >= today)

  const capacity = Math.max(1, drivers.length)
  const shortages = trips.length ? computeShortages(trips, capacity) : []

  // Un même chauffeur affecté à deux voyages qui se chevauchent.
  const driverConflicts: DriverConflict[] = []
  for (const driver of drivers) {
    const assigned = trips.filter((t) => t.assignedDriverId === driver.id)
    const refs = new Set<string>()
    for (let i = 0; i < assigned.length; i++) {
      for (let j = i + 1; j < assigned.length; j++) {
        if (assigned[i].start <= assigned[j].end && assigned[j].start <= assigned[i].end) {
          refs.add(assigned[i].reference)
          refs.add(assigned[j].reference)
        }
      }
    }
    if (refs.size) driverConflicts.push({ driverId: driver.id, driverName: driver.name, references: [...refs] })
  }

  return { capacity, activeDrivers: drivers.length, shortages, driverConflicts }
}

/** Le voyage indiqué fait-il partie d'une période de manque de véhicules/chauffeurs ? */
export async function shortageForTrip(quoteId: string) {
  const report = await getCapacityReport()
  return report.shortages.find((s) => s.trips.some((t) => t.id === quoteId)) || null
}
