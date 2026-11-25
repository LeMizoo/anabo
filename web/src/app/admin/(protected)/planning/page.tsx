import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { quoteStatusColor, quoteStatusLabel } from '@/lib/quote-status'
import { getCapacityReport } from '@/lib/fleet-capacity'

export const dynamic = 'force-dynamic'

const DAY = 86_400_000

type Trip = {
  id: string
  reference: string
  status: string
  client: string
  circuit: string
  start: Date
  end: Date
  days: number
  travellers: string
  vehicle: string
  driver: string | null
}

function tripEnd(start: Date, end: Date | null, duration: number | null) {
  if (end && end >= start) return end
  if (duration && duration > 0) return new Date(start.getTime() + (duration - 1) * DAY)
  return start
}

// Dates de voyage calendaires : UTC pour ne pas décaler d'un jour.
const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', timeZone: 'UTC' })

type Props = { searchParams: Promise<{ passes?: string }> }

export default async function PlanningPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { passes } = await searchParams
  const showPast = passes === '1'
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z')

  const quotes = await prisma.quoteRequest.findMany({
    where: {
      status: { in: ['CONFIRME', 'DEVIS_ENVOYE'] },
      startDate: { not: null },
    },
    orderBy: { startDate: 'asc' },
    select: {
      id: true, reference: true, status: true, firstName: true, lastName: true,
      circuitTitle: true, circuitSlug: true, startDate: true, endDate: true,
      selectedDurationDays: true, adults: true, children: true,
      vehicleLabel: true, vehicleCount: true, assignedDriverId: true,
    },
  })
  const [report, drivers] = await Promise.all([
    getCapacityReport(),
    prisma.driver.findMany({ select: { id: true, name: true } }),
  ])
  const driverName = new Map(drivers.map((d) => [d.id, d.name]))

  const trips: Trip[] = quotes
    .map((q) => {
      const start = q.startDate as Date
      const end = tripEnd(start, q.endDate, q.selectedDurationDays)
      return {
        id: q.id,
        reference: q.reference,
        status: q.status,
        client: `${q.firstName} ${q.lastName}`,
        circuit: q.circuitTitle || q.circuitSlug || 'Circuit à définir',
        start,
        end,
        days: Math.round((end.getTime() - start.getTime()) / DAY) + 1,
        travellers: `${q.adults} ad.${q.children ? ` / ${q.children} enf.` : ''}`,
        vehicle: q.vehicleLabel ? `${q.vehicleLabel}${q.vehicleCount > 1 ? ` ×${q.vehicleCount}` : ''}` : '—',
        driver: q.assignedDriverId ? driverName.get(q.assignedDriverId) || null : null,
      }
    })
    .filter((t) => showPast || t.end >= today)

  // Voyages confirmés en manque de véhicule/chauffeur (renfort nécessaire).
  const confirmed = trips.filter((t) => t.status === 'CONFIRME')
  const overlaps = new Map<string, string[]>()
  for (const shortage of report.shortages) {
    for (const trip of shortage.trips) {
      const others = shortage.trips.filter((o) => o.id !== trip.id).map((o) => o.reference)
      overlaps.set(trip.id, [...new Set([...(overlaps.get(trip.id) || []), ...others])])
    }
  }

  const byMonth = new Map<string, Trip[]>()
  for (const trip of trips) {
    const key = trip.start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    byMonth.set(key, [...(byMonth.get(key) || []), trip])
  }

  const upcomingConfirmed = confirmed.filter((t) => t.end >= today)
  const busyDays = upcomingConfirmed.reduce((sum, t) => sum + t.days, 0)
  const next = upcomingConfirmed.find((t) => t.start >= today)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning des voyages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Voyages confirmés et devis envoyés ayant une date de départ.
          </p>
        </div>
        <Link
          href={showPast ? '/admin/planning' : '/admin/planning?passes=1'}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {showPast ? 'Masquer les voyages passés' : 'Afficher aussi les voyages passés'}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Voyages confirmés à venir</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{upcomingConfirmed.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Jours de route réservés</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{busyDays}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Prochain départ</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {next ? `${fmt(next.start)} — ${next.client}` : 'Aucun'}
          </p>
        </div>
      </div>

      {report.shortages.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-950">
          <p className="text-base font-semibold">
            {report.shortages.length === 1 ? 'Des voyages confirmés se chevauchent' : `${report.shortages.length} périodes où des voyages confirmés se chevauchent`}
          </p>
          <p className="mt-1">
            Disponibles : {report.capacity} véhicule(s)/chauffeur(s) actif(s){report.activeDrivers === 0 ? ' (aucun chauffeur enregistré : un seul véhicule compté)' : ''}.
            Pour honorer toutes les demandes, ajoutez temporairement des véhicules et chauffeurs.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {report.shortages.map((s) => (
              <li key={s.start.toISOString()}>
                <strong>{fmt(s.start)} → {fmt(s.end)}</strong> : {s.required} véhicule(s) nécessaires, {s.capacity} disponible(s) —
                il manque <strong>{s.missing}</strong> véhicule(s)/chauffeur(s) ({s.trips.map((t) => `${t.reference} · ${t.client}`).join(' ; ')}).
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/admin/chauffeurs?new=1&temporaire=1" className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
              Ajouter un chauffeur / véhicule de renfort
            </Link>
            <Link href="/admin/chauffeurs" className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100">
              Gérer les chauffeurs
            </Link>
          </div>
        </div>
      )}

      {report.driverConflicts.length > 0 && (
        <div role="alert" className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-950">
          <strong>Double affectation :</strong>{' '}
          {report.driverConflicts.map((c) => `${c.driverName} est affecté(e) à ${c.references.join(' et ')} sur des dates qui se chevauchent`).join(' ; ')}.
          Réaffectez l’un des voyages depuis sa fiche.
        </div>
      )}

      {byMonth.size === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          Aucun voyage planifié pour le moment.
        </p>
      ) : (
        [...byMonth.entries()].map(([month, monthTrips]) => (
          <section key={month} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <h2 className="border-b border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              {month} <span className="font-normal text-gray-400">({monthTrips.length})</span>
            </h2>
            <ul className="divide-y divide-gray-100">
              {monthTrips.map((trip) => (
                <li key={trip.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-28 shrink-0 text-sm">
                      <p className="font-semibold text-gray-900">{fmt(trip.start)} → {fmt(trip.end)}</p>
                      <p className="text-xs text-gray-500">{trip.days} jour{trip.days > 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-sm">
                      <Link href={`/admin/demandes/${trip.id}`} className="font-semibold text-blue-700 hover:underline">
                        {trip.client}
                      </Link>{' '}
                      <span className="text-gray-400">· {trip.reference}</span>
                      <p className="text-gray-600">{trip.circuit}</p>
                      <p className="text-xs text-gray-500">{trip.travellers} · {trip.vehicle}</p>
                      <p className={`text-xs ${trip.driver ? 'text-gray-600' : 'text-orange-700'}`}>
                        Chauffeur : {trip.driver || 'non affecté'}
                      </p>
                      {overlaps.has(trip.id) && (
                        <p className="mt-1 text-xs font-semibold text-red-700">
                          Renfort nécessaire, chevauche : {overlaps.get(trip.id)?.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-semibold sm:self-center ${quoteStatusColor(trip.status)}`}>
                    {quoteStatusLabel(trip.status)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
