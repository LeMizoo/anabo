import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { StatusUpdateForm } from '@/components/admin/StatusUpdateForm'
import { FormSubmitButton } from '@/components/admin/FormSubmitButton'
import { saveQuoteDetails } from '@/app/admin/actions'
import type { QuoteEstimateSnapshot } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

function parseEstimate(value: string | null): QuoteEstimateSnapshot | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as QuoteEstimateSnapshot
    return (parsed.version === 1 || parsed.version === 2) && typeof parsed.finalPrice === 'number' && typeof parsed.currency === 'string'
      ? parsed
      : null
  } catch {
    return null
  }
}

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${value.toLocaleString('fr-FR')} ${currency}`
  }
}

async function save(formData: FormData) {
  'use server'
  const id = String(formData.get('id') || '')
  const quoteDetails = String(formData.get('quoteDetails') || '')
  const adminNotes = String(formData.get('adminNotes') || '')
  if (!id) return
  await saveQuoteDetails(id, quoteDetails, adminNotes)
  redirect(`/admin/demandes/${id}`)
}

export default async function AdminDemandeDetailPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const quote = await prisma.quoteRequest.findUnique({ where: { id } })
  if (!quote) notFound()
  const estimate = parseEstimate(quote.estimateDetails)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Demande {quote.reference}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {quote.firstName} {quote.lastName} — {quote.email}
          </p>
        </div>
        <Link
          href="/admin/demandes"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Retour à la liste
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Détails de la demande</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Statut actuel</dt>
                <dd className="mt-1 font-medium">{quote.status}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Téléphone</dt>
                <dd className="mt-1 text-gray-900">{quote.phone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Pays</dt>
                <dd className="mt-1 text-gray-900">{quote.country || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Circuit</dt>
                <dd className="mt-1 text-gray-900">
                  {quote.circuitTitle || quote.circuitSlug || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Dates</dt>
                <dd className="mt-1 text-gray-900">
                  {quote.startDate
                    ? new Date(quote.startDate).toLocaleDateString('fr-FR')
                    : '—'}
                  {' → '}
                  {quote.endDate
                    ? new Date(quote.endDate).toLocaleDateString('fr-FR')
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Voyageurs</dt>
                <dd className="mt-1 text-gray-900">
                  {quote.adults} ad. / {quote.children} enf.
                </dd>
              </div>
              {quote.vehicleCode && <div>
                <dt className="text-gray-500">Véhicule demandé</dt>
                <dd className="mt-1 text-gray-900">{quote.vehicleLabel || quote.vehicleCode} <span className="text-gray-500">[{quote.vehicleCode}]</span> · {quote.vehicleCount} véhicule(s) · {quote.consecutiveCircuits} circuit(s) consécutif(s)</dd>
              </div>}
              {quote.pricingMode && <div><dt className="text-gray-500">Mode demandé</dt><dd className="mt-1 text-gray-900">{quote.pricingMode === 'DAILY_CAR' ? 'Daily price car' : 'Tour price (included vehicle)'}</dd></div>}
              {quote.pricingPackageName && <div><dt className="text-gray-500">Package demandé</dt><dd className="mt-1 text-gray-900">{quote.pricingPackageName}</dd></div>}
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Message</dt>
                <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                  {quote.message || '—'}
                </dd>
              </div>
            </dl>
          </section>

          {estimate && <section className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-lg font-semibold text-green-950">Estimation indicative reçue</h2><p className="mt-1 text-sm text-green-800">Calculée côté serveur le {new Date(estimate.calculatedAt).toLocaleString('fr-FR')}</p></div>
              <p className="text-2xl font-bold text-green-950">{formatMoney(estimate.finalPrice, estimate.currency)}</p>
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-green-800">Voyageurs</dt><dd className="mt-1 font-medium text-gray-900">{estimate.adults} adulte(s), {estimate.children} enfant(s) — {estimate.people} au total</dd></div>
              <div><dt className="text-green-800">Durée et demandes</dt><dd className="mt-1 font-medium text-gray-900">{estimate.days} jour(s), {estimate.consecutiveCircuits} circuit(s) consécutif(s), {estimate.vehicleCount} véhicule(s) demandé(s)</dd></div>
              <div><dt className="text-green-800">{estimate.pricingMode === 'TOUR_INCLUDED' ? 'Prix global du circuit (véhicule inclus)' : 'Base historique'}</dt><dd className="mt-1 font-medium text-gray-900">{estimate.pricingMode === 'TOUR_INCLUDED' ? formatMoney(estimate.baseTotal, estimate.currency) : `${formatMoney(estimate.basePricePerPerson, estimate.currency)} × ${estimate.people} = ${formatMoney(estimate.baseTotal, estimate.currency)}`}</dd></div>
              {estimate.vehicle && <div><dt className="text-green-800">Location véhicule</dt><dd className="mt-1 font-medium text-gray-900">{estimate.vehicle.label} [tarif {estimate.vehicle.code}{estimate.vehicle.matchedOptionCode !== estimate.vehicle.code ? ` · option locale ${estimate.vehicle.matchedOptionCode}` : ''}] — {estimate.vehicle.capacity} places, {estimate.vehicle.vehiclesCharged} facturé(s), {formatMoney(estimate.vehicle.total, estimate.currency)}{estimate.vehicle.indicativeOnly ? ' · tarif indicatif' : ''}</dd></div>}
              {estimate.package && <div className="sm:col-span-2"><dt className="text-green-800">Package : {estimate.package.name}</dt><dd className="mt-1 space-y-1 font-medium text-gray-900">{estimate.package.items.map((item) => <p key={item.code}>{item.name} — {formatMoney(item.unitPrice, estimate.currency)} × {item.quantity} = {formatMoney(item.total, estimate.currency)}</p>)}<p>Total package : {formatMoney(estimate.package.total, estimate.currency)}</p></dd></div>}
              <div><dt className="text-green-800">Sous-total</dt><dd className="mt-1 font-medium text-gray-900">{formatMoney(estimate.subtotal, estimate.currency)}</dd></div>
              <div><dt className="text-green-800">Réductions appliquées</dt><dd className="mt-1 font-medium text-gray-900">{estimate.discounts.multiplex.percentage > 0 ? `Multiplex −${estimate.discounts.multiplex.percentage}% (${formatMoney(estimate.discounts.multiplex.amount, estimate.currency)})` : 'Multiplex : aucune'}<br />{estimate.discounts.fleet.percentage > 0 ? `Flotte −${estimate.discounts.fleet.percentage}% (${formatMoney(estimate.discounts.fleet.amount, estimate.currency)})` : 'Flotte : aucune'}</dd></div>
            </dl>
            <p className="mt-4 border-t border-green-200 pt-3 text-xs text-green-900">Le devis peut être ajusté selon les disponibilités, la saison et les échanges avec le client.</p>
          </section>}
          {!estimate && quote.circuitSlug === 'sur-mesure' && <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
            <h2 className="font-semibold">Aucune estimation automatique enregistrée</h2>
            <p className="mt-1">Vérifiez que le circuit « sur-mesure » possède un tarif et que la clé du véhicule sélectionné correspond à une clé ou à un alias configuré dans Prix et véhicules.</p>
          </section>}

          <form
            action={save}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
          >
            <input type="hidden" name="id" value={quote.id} />
            <div>
              <label htmlFor="quote-details" className="mb-2 block text-lg font-semibold">Rédiger le devis</label>
              <textarea
                id="quote-details"
                name="quoteDetails"
                defaultValue={quote.quoteDetails || ''}
                rows={8}
                maxLength={20000}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Contenu du devis envoyé au client..."
              />
            </div>
            <div>
              <label htmlFor="admin-notes" className="mb-2 block text-lg font-semibold">Notes privées</label>
              <textarea
                id="admin-notes"
                name="adminNotes"
                defaultValue={quote.adminNotes || ''}
                rows={4}
                maxLength={20000}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Notes internes (non visibles par le client)..."
              />
            </div>
            <div className="flex justify-end">
              <FormSubmitButton
                label="Enregistrer le devis et les notes"
                pendingLabel="Enregistrement..."
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </form>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Mise à jour du statut</h2>
            <p className="text-sm text-gray-500 mb-4">
              Assurez-vous d&apos;avoir enregistré le devis ci-dessus avant de changer le statut.
            </p>
            <StatusUpdateForm
              quoteId={quote.id}
              currentStatus={quote.status}
            />
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-sm">
            <h2 className="text-lg font-semibold mb-2">Historique</h2>
            <ul className="space-y-1 text-gray-600">
              <li>Créée le {new Date(quote.createdAt).toLocaleDateString('fr-FR')}</li>
              {quote.contactedAt && (
                <li>Contactée le {new Date(quote.contactedAt).toLocaleDateString('fr-FR')}</li>
              )}
              {quote.quoteSentAt && (
                <li>Devis envoyé le {new Date(quote.quoteSentAt).toLocaleDateString('fr-FR')}</li>
              )}
              {quote.confirmedAt && (
                <li>Confirmée le {new Date(quote.confirmedAt).toLocaleDateString('fr-FR')}</li>
              )}
              {quote.lostAt && (
                <li>Perdue le {new Date(quote.lostAt).toLocaleDateString('fr-FR')}</li>
              )}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
