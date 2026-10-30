import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { StatusUpdateForm } from '@/components/admin/StatusUpdateForm'
import { saveQuoteDetails } from '@/app/admin/actions'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
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
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Message</dt>
                <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                  {quote.message || '—'}
                </dd>
              </div>
            </dl>
          </section>

          <form
            action={save}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
          >
            <input type="hidden" name="id" value={quote.id} />
            <div>
              <h2 className="text-lg font-semibold mb-2">Rédiger le devis</h2>
              <textarea
                name="quoteDetails"
                defaultValue={quote.quoteDetails || ''}
                rows={8}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contenu du devis envoyé au client..."
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Notes privées</h2>
              <textarea
                name="adminNotes"
                defaultValue={quote.adminNotes || ''}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notes internes (non visibles par le client)..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Enregistrer le devis et les notes
              </button>
            </div>
          </form>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Mise à jour du statut</h2>
            <p className="text-sm text-gray-500 mb-4">
              Assurez-vous d'avoir enregistré le devis ci-dessus avant de changer le statut.
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