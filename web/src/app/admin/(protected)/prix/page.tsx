import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { FormSubmitButton } from '@/components/admin/FormSubmitButton'
import { VehicleRatesEditor } from '@/components/admin/VehicleRatesEditor'
import { saveCircuitDurations, saveVehicles } from '@/app/admin/actions'
import { getCircuitDurations, getVehicles } from '@/lib/pricing'
import { sanityClient } from '@/lib/sanity'
import { adminCircuitsQuery } from '@/lib/queries'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ saved?: string; error?: string }>
}

type SanityCircuit = { key: string; title: string; language?: string }

async function saveVehiclesAction(formData: FormData) {
  'use server'
  const result = await saveVehicles(formData)
  if (result.success) redirect('/admin/prix?saved=vehicles')
  redirect(`/admin/prix?error=${encodeURIComponent(result.error)}`)
}

async function saveDurationsAction(formData: FormData) {
  'use server'
  const result = await saveCircuitDurations(formData)
  if (result.success) redirect('/admin/prix?saved=circuits')
  redirect(`/admin/prix?error=${encodeURIComponent(result.error)}`)
}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

const submitClass =
  'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

async function getSanityCircuits(): Promise<{ key: string; title: string }[]> {
  try {
    const rows = await sanityClient.fetch<SanityCircuit[]>(adminCircuitsQuery, {}, { cache: 'no-store' })
    const byKey = new Map<string, { key: string; title: string; language?: string }>()
    for (const row of rows) {
      const known = byKey.get(row.key)
      // Une ligne par circuit : on garde le titre français quand il existe.
      if (!known || (row.language === 'fr' && known.language !== 'fr')) byKey.set(row.key, row)
    }
    return Array.from(byKey.values())
      .map(({ key, title }) => ({ key, title }))
      .sort((a, b) => a.title.localeCompare(b.title, 'fr'))
  } catch (error) {
    console.error('[admin/prix] Lecture des circuits Sanity impossible :', error)
    return []
  }
}

export default async function AdminPrixPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { saved, error } = await searchParams
  const [vehicles, durations, circuits] = await Promise.all([
    getVehicles(),
    getCircuitDurations(),
    getSanityCircuits(),
  ])

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prix</h1>
        <p className="mt-1 text-sm text-gray-500">
          Deux listes suffisent : le prix par jour de chaque véhicule et la durée de chaque circuit. Le prix d&apos;un
          circuit = nombre de jours × prix par jour du véhicule. Il n&apos;y a pas de prix par personne.
        </p>
      </div>

      {saved && (
        <p className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900" role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {saved === 'circuits' ? 'Les durées des circuits ont bien été enregistrées.' : 'Les véhicules ont bien été enregistrés.'}
          {' '}Le site est à jour.
        </p>
      )}
      {error && (
        <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Véhicules</h2>
          <p className="text-sm text-gray-500">
            Prix par jour et nombre de places. Les modèles (Prado, Grand Starex) sont indicatifs : plusieurs véhicules
            restent possibles selon la demande.
          </p>
        </div>
        <form action={saveVehiclesAction} className="space-y-6">
          <VehicleRatesEditor initial={vehicles} />
          <div className="flex justify-end">
            <FormSubmitButton label="Enregistrer les véhicules" pendingLabel="Enregistrement..." className={submitClass} />
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Circuits : durée selon la saison</h2>
          <p className="text-sm text-gray-500">
            Fourchette approximative de jours (minimum – maximum) selon la qualité de la route. Laissez vide si la
            durée est inconnue pour la saison. Les circuits viennent de Sanity : pour en ajouter un, créez sa page
            circuit dans Sanity Studio, il apparaît ici automatiquement.
          </p>
        </div>

        {circuits.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
            Aucun circuit trouvé dans Sanity.
          </p>
        ) : (
          <form action={saveDurationsAction} className="space-y-6">
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3" rowSpan={2}>Circuit</th>
                    <th className="px-4 py-2 text-center" colSpan={2}>Saison sèche (jours)</th>
                    <th className="px-4 py-2 text-center" colSpan={2}>Saison des pluies (jours)</th>
                  </tr>
                  <tr>
                    <th className="px-2 pb-2 text-center font-medium">Min</th>
                    <th className="px-2 pb-2 text-center font-medium">Max</th>
                    <th className="px-2 pb-2 text-center font-medium">Min</th>
                    <th className="px-2 pb-2 text-center font-medium">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {circuits.map((circuit) => {
                    const d = durations[circuit.key]
                    return (
                      <tr key={circuit.key}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {circuit.title}
                          <input type="hidden" name="circuitKey" value={circuit.key} />
                        </td>
                        {([
                          ['dryMin', d?.dry?.min],
                          ['dryMax', d?.dry?.max],
                          ['rainyMin', d?.rainy?.min],
                          ['rainyMax', d?.rainy?.max],
                        ] as const).map(([name, value]) => (
                          <td key={name} className="px-2 py-2">
                            <input
                              className={`${inputClass} text-center`}
                              name={name}
                              type="number"
                              inputMode="numeric"
                              min={1}
                              max={120}
                              step={1}
                              defaultValue={value ?? ''}
                              aria-label={`${circuit.title} – ${name}`}
                            />
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <FormSubmitButton label="Enregistrer les durées" pendingLabel="Enregistrement..." className={submitClass} />
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
