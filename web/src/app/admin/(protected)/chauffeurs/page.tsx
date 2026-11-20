import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCapacityReport, tripEnd } from '@/lib/fleet-capacity'
import { FormSubmitButton } from '@/components/admin/FormSubmitButton'
import { deleteDriver, saveDriver, toggleDriver } from './actions'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ ok?: string; erreur?: string; new?: string; temporaire?: string }> }

type DriverFormValues = {
  id?: string
  name?: string
  phone?: string | null
  email?: string | null
  languages?: string | null
  licenseNumber?: string | null
  vehicleLabel?: string | null
  vehicleSeats?: number | null
  isTemporary?: boolean
  notes?: string | null
}

const input =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100'

function DriverFields({ values = {} }: { values?: DriverFormValues }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <label className="text-sm font-medium text-gray-700">
        Nom complet *
        <input name="name" required maxLength={150} defaultValue={values.name || ''} className={input} />
      </label>
      <label className="text-sm font-medium text-gray-700">
        Téléphone / WhatsApp
        <input name="phone" maxLength={40} defaultValue={values.phone || ''} className={input} />
      </label>
      <label className="text-sm font-medium text-gray-700">
        E-mail
        <input name="email" type="email" maxLength={191} defaultValue={values.email || ''} className={input} />
      </label>
      <label className="text-sm font-medium text-gray-700">
        Langues parlées
        <input name="languages" maxLength={191} placeholder="Malagasy, français, anglais…" defaultValue={values.languages || ''} className={input} />
      </label>
      <label className="text-sm font-medium text-gray-700">
        N° de permis
        <input name="licenseNumber" maxLength={80} defaultValue={values.licenseNumber || ''} className={input} />
      </label>
      <label className="text-sm font-medium text-gray-700">
        Véhicule fourni
        <input name="vehicleLabel" maxLength={150} placeholder="Toyota Prado 4x4, minibus…" defaultValue={values.vehicleLabel || ''} className={input} />
      </label>
      <label className="text-sm font-medium text-gray-700">
        Places passagers
        <input name="vehicleSeats" type="number" min={1} max={60} defaultValue={values.vehicleSeats ?? ''} className={input} />
      </label>
      <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-gray-700">
        <input type="checkbox" name="isTemporary" defaultChecked={values.isTemporary} className="h-4 w-4" />
        Renfort temporaire (pour les périodes chargées)
      </label>
      <label className="text-sm font-medium text-gray-700 sm:col-span-2">
        Notes internes
        <textarea name="notes" rows={2} maxLength={5000} defaultValue={values.notes || ''} className={input} />
      </label>
    </div>
  )
}

const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })

export default async function DriversPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')
  const isSuperAdmin = (session.user as { role?: string })?.role === 'SUPER_ADMIN'
  const { ok, erreur, new: openNew, temporaire } = await searchParams

  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z')
  const [drivers, assignedTrips, report] = await Promise.all([
    prisma.driver.findMany({ orderBy: [{ active: 'desc' }, { isTemporary: 'asc' }, { name: 'asc' }] }),
    prisma.quoteRequest.findMany({
      where: { assignedDriverId: { not: null }, status: { in: ['CONFIRME', 'DEVIS_ENVOYE'] }, startDate: { not: null } },
      orderBy: { startDate: 'asc' },
      select: { id: true, reference: true, firstName: true, lastName: true, startDate: true, endDate: true, selectedDurationDays: true, assignedDriverId: true, status: true },
    }),
    getCapacityReport(),
  ])

  const upcomingFor = (driverId: string) =>
    assignedTrips
      .filter((t) => t.assignedDriverId === driverId)
      .map((t) => ({ ...t, end: tripEnd(t.startDate as Date, t.endDate, t.selectedDurationDays) }))
      .filter((t) => t.end >= today)

  const conflictRefs = new Map(report.driverConflicts.map((c) => [c.driverId, c.references]))

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chauffeurs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Équipe permanente et renforts temporaires. Chaque chauffeur actif compte pour un véhicule disponible dans le planning.
          </p>
        </div>
        <Link href="/admin/planning" className="text-sm font-medium text-blue-600 hover:underline">Voir le planning →</Link>
      </div>

      {ok && <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">{ok}</p>}
      {erreur && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{erreur}</p>}

      {report.shortages.length > 0 && (
        <div role="alert" className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-950">
          <p className="font-semibold">Renfort nécessaire : des voyages confirmés se chevauchent.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {report.shortages.map((s) => (
              <li key={s.start.toISOString()}>
                {fmt(s.start)} → {fmt(s.end)} : {s.required} véhicule(s) nécessaires, {s.capacity} disponible(s) —{' '}
                <strong>ajoutez {s.missing} chauffeur(s)/véhicule(s)</strong> ({s.trips.map((t) => t.reference).join(', ')}).
              </li>
            ))}
          </ul>
        </div>
      )}

      <details open={openNew === '1' || drivers.length === 0} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <summary className="cursor-pointer text-lg font-semibold text-gray-900">+ Ajouter un chauffeur</summary>
        <form action={saveDriver} className="mt-4 space-y-4">
          <DriverFields values={{ isTemporary: temporaire === '1' }} />
          <FormSubmitButton label="Ajouter le chauffeur" pendingLabel="Ajout…" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60" />
        </form>
      </details>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Chauffeurs actifs</p>
          <p className="text-2xl font-bold text-gray-900">{report.activeDrivers}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Dont renforts temporaires</p>
          <p className="text-2xl font-bold text-gray-900">{drivers.filter((d) => d.active && d.isTemporary).length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Voyages à venir affectés</p>
          <p className="text-2xl font-bold text-gray-900">{drivers.reduce((n, d) => n + upcomingFor(d.id).length, 0)}</p>
        </div>
      </div>

      {drivers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          Aucun chauffeur enregistré. Tant que la liste est vide, le planning compte un seul véhicule disponible (Vonjy).
        </p>
      ) : (
        <ul className="space-y-3">
          {drivers.map((driver) => {
            const upcoming = upcomingFor(driver.id)
            const conflicts = conflictRefs.get(driver.id)
            return (
              <li key={driver.id} className={`rounded-xl border bg-white p-5 shadow-sm ${driver.active ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="text-sm">
                    <p className="text-base font-semibold text-gray-900">
                      {driver.name}{' '}
                      {driver.isTemporary && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Renfort</span>}
                      {!driver.active && <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">Inactif</span>}
                    </p>
                    <p className="text-gray-600">
                      {[driver.phone, driver.email, driver.languages].filter(Boolean).join(' · ') || '—'}
                    </p>
                    {(driver.vehicleLabel || driver.vehicleSeats) && (
                      <p className="text-gray-600">
                        Véhicule : {driver.vehicleLabel || '—'}{driver.vehicleSeats ? ` (${driver.vehicleSeats} places)` : ''}
                      </p>
                    )}
                    {upcoming.length > 0 ? (
                      <p className="mt-1 text-gray-700">
                        Prochains voyages :{' '}
                        {upcoming.slice(0, 3).map((t, i) => (
                          <span key={t.id}>
                            {i > 0 && ', '}
                            <Link href={`/admin/demandes/${t.id}`} className="text-blue-700 hover:underline">
                              {fmt(t.startDate as Date)} ({t.firstName} {t.lastName})
                            </Link>
                          </span>
                        ))}
                        {upcoming.length > 3 && ` +${upcoming.length - 3}`}
                      </p>
                    ) : (
                      <p className="mt-1 text-gray-400">Aucun voyage à venir affecté.</p>
                    )}
                    {conflicts && (
                      <p className="mt-1 font-semibold text-red-700">Double affectation sur des dates qui se chevauchent : {conflicts.join(', ')}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <form action={toggleDriver}>
                      <input type="hidden" name="id" value={driver.id} />
                      <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                        {driver.active ? 'Désactiver' : 'Réactiver'}
                      </button>
                    </form>
                    {isSuperAdmin && (
                      <form action={deleteDriver}>
                        <input type="hidden" name="id" value={driver.id} />
                        <button className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">
                          Supprimer
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-blue-700">Modifier</summary>
                  <form action={saveDriver} className="mt-3 space-y-3">
                    <DriverFields values={driver} />
                    <FormSubmitButton label="Enregistrer" pendingLabel="Enregistrement…" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60" />
                  </form>
                </details>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
