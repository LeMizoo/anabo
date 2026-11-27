import { prisma } from '@/lib/prisma'
import { depositAmount, getPaymentSettings } from '@/lib/payment-settings'

/** Ligne comptable d'un voyage confirmé (montants entiers, dans la devise du devis). */
export type AccountingTrip = {
  id: string
  reference: string
  client: string
  circuit: string
  date: Date
  currency: string
  total: number | null
  deposit: number
  depositPaidAt: Date | null
  balance: number
  balancePaidAt: Date | null
  collected: number
  remaining: number
  archived: boolean
}

export type CurrencyTotals = { currency: string; trips: number; total: number; collected: number; remaining: number }
export type MonthRow = { month: number; byCurrency: CurrencyTotals[] }

/**
 * Voyages confirmés d'une année (date de départ, à défaut date de confirmation),
 * y compris archivés : un voyage terminé reste dans la comptabilité.
 */
export async function getAccounting(year: number) {
  const from = new Date(Date.UTC(year, 0, 1))
  const to = new Date(Date.UTC(year + 1, 0, 1))
  const [settings, quotes] = await Promise.all([
    getPaymentSettings(),
    prisma.quoteRequest.findMany({
      where: {
        status: 'CONFIRME',
        OR: [
          { startDate: { gte: from, lt: to } },
          { startDate: null, confirmedAt: { gte: from, lt: to } },
        ],
      },
      orderBy: [{ startDate: 'asc' }, { confirmedAt: 'asc' }],
      select: {
        id: true, reference: true, firstName: true, lastName: true, circuitTitle: true, circuitSlug: true,
        startDate: true, confirmedAt: true, createdAt: true, quoteTotalAmount: true, quoteCurrency: true,
        depositPaidAt: true, balancePaidAt: true, archivedAt: true,
      },
    }),
  ])

  const trips: AccountingTrip[] = quotes.map((q) => {
    const total = q.quoteTotalAmount ?? null
    const deposit = total ? depositAmount(total, settings.depositPercent) ?? 0 : 0
    const balance = total ? Math.max(total - deposit, 0) : 0
    const collected = (q.depositPaidAt ? deposit : 0) + (q.balancePaidAt ? balance : 0)
    return {
      id: q.id,
      reference: q.reference,
      client: `${q.firstName} ${q.lastName}`,
      circuit: q.circuitTitle || q.circuitSlug || 'Voyage sur mesure',
      date: q.startDate ?? q.confirmedAt ?? q.createdAt,
      currency: (q.quoteCurrency || 'EUR').toUpperCase(),
      total,
      deposit,
      depositPaidAt: q.depositPaidAt,
      balance,
      balancePaidAt: q.balancePaidAt,
      collected,
      remaining: total ? Math.max(total - collected, 0) : 0,
      archived: Boolean(q.archivedAt),
    }
  })

  const sum = (list: AccountingTrip[]): CurrencyTotals[] => {
    const map = new Map<string, CurrencyTotals>()
    for (const t of list) {
      if (t.total === null) continue
      const c = map.get(t.currency) || { currency: t.currency, trips: 0, total: 0, collected: 0, remaining: 0 }
      c.trips += 1
      c.total += t.total
      c.collected += t.collected
      c.remaining += t.remaining
      map.set(t.currency, c)
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  }

  const months: MonthRow[] = Array.from({ length: 12 }, (_, month) => ({
    month,
    byCurrency: sum(trips.filter((t) => t.date.getUTCMonth() === month)),
  }))

  return {
    year,
    depositPercent: settings.depositPercent,
    trips,
    totals: sum(trips),
    months,
    missingAmount: trips.filter((t) => t.total === null),
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
