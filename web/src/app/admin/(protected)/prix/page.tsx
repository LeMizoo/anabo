import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { FormSubmitButton } from '@/components/admin/FormSubmitButton'
import { saveVehicleRates } from '@/app/admin/actions'
import { getVehicleRates } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ saved?: string; error?: string }>
}

async function save(formData: FormData) {
  'use server'
  const result = await saveVehicleRates(formData)
  if (result.success) redirect('/admin/prix?saved=1')
  redirect(`/admin/prix?error=${encodeURIComponent(result.error)}`)
}

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

export default async function AdminPrixPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { saved, error } = await searchParams
  const rates = await getVehicleRates()

  const vehicles = [
    {
      title: '4x4',
      rateField: 'rate4x4',
      modelField: 'model4x4',
      rate: rates.fourByFourPerDay,
      model: rates.fourByFourModel,
    },
    {
      title: 'Mini van',
      rateField: 'rateMinivan',
      modelField: 'modelMinivan',
      rate: rates.miniVanPerDay,
      model: rates.miniVanModel,
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prix des véhicules</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tarif par véhicule et par jour, en euros. Il n&apos;y a pas de prix par personne : le prix d&apos;un
          circuit = nombre total de jours du circuit (saisi dans Sanity Studio) × tarif du véhicule.
        </p>
      </div>

      {saved && (
        <p
          className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Les tarifs ont bien été enregistrés. Ils sont à jour sur le site.
        </p>
      )}
      {error && (
        <p
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <form action={save} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {vehicles.map((vehicle) => (
            <section
              key={vehicle.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">{vehicle.title}</h2>
              <label className="mt-4 block text-sm font-medium text-gray-700">
                Prix par jour (€)
                <input
                  className={inputClass}
                  name={vehicle.rateField}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100000}
                  step={1}
                  defaultValue={vehicle.rate}
                  required
                />
              </label>
              <label className="mt-4 block text-sm font-medium text-gray-700">
                Modèle indicatif
                <input
                  className={inputClass}
                  name={vehicle.modelField}
                  type="text"
                  maxLength={100}
                  defaultValue={vehicle.model}
                  required
                />
              </label>
            </section>
          ))}
        </div>

        <p className="text-sm text-gray-500">
          Les modèles (Prado, Grand Starex) ne sont donnés qu&apos;à titre indicatif : plusieurs véhicules
          restent possibles selon la demande.
        </p>

        <div className="flex justify-end">
          <FormSubmitButton
            label="Enregistrer les tarifs"
            pendingLabel="Enregistrement..."
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </form>
    </div>
  )
}
