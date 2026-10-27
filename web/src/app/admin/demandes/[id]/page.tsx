import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { updateQuoteStatus } from '../actions'

export const dynamic = 'force-dynamic'

export default async function AdminDemandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params

  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
  })

  if (!quote) notFound()

  async function handleSubmit(formData: FormData) {
    'use server'
    const status = formData.get('status') as string
    const notes = formData.get('adminNotes') as string
    await updateQuoteStatus(id, status, notes)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Link 
          href="/admin/demandes" 
          className="inline-block text-sm text-blue-600 hover:underline mb-4"
        >
          ← Retour aux demandes
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#06245F] md:text-2xl">
                Demande {quote.reference}
              </h1>
              <p className="text-sm text-gray-500">
                Reçue le {new Date(quote.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              {quote.status}
            </span>
          </div>

          <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2">
            <div>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 md:text-sm">
                Client
              </h2>
              <div className="space-y-1 break-words text-sm md:text-base">
                <p className="font-medium">{quote.firstName} {quote.lastName}</p>
                <p className="text-gray-600 truncate" title={quote.email}>
                  <a href={`mailto:${quote.email}`} className="hover:underline">{quote.email}</a>
                </p>
                <p className="text-gray-600">{quote.phone}</p>
                <p className="text-gray-600">{quote.country || '—'}</p>
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 md:text-sm">
                Voyage
              </h2>
              <div className="space-y-1 break-words text-sm md:text-base">
                <p className="text-gray-600">
                  <strong>Circuit :</strong> {quote.circuitTitle || quote.circuitSlug || '—'}
                </p>
                <p className="text-gray-600">
                  <strong>Dates :</strong> {quote.startDate ? new Date(quote.startDate).toLocaleDateString('fr-FR') : '—'} → {quote.endDate ? new Date(quote.endDate).toLocaleDateString('fr-FR') : '—'}
                </p>
                <p className="text-gray-600">
                  <strong>Voyageurs :</strong> {quote.adults} adulte(s), {quote.children} enfant(s)
                </p>
              </div>
            </div>
          </div>

          {quote.message && (
            <div className="mt-6 md:mt-8">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 md:text-sm">
                Message du client
              </h2>
              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap break-words md:text-base">
                {quote.message}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6 md:mt-10 md:pt-8">
            <h2 className="mb-4 text-lg font-bold text-[#06245F]">
              Suivi de la demande
            </h2>
            
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  name="status"
                  defaultValue={quote.status}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#06245F] focus:ring-1 focus:ring-[#06245F]"
                >
                  <option value="NOUVEAU">Nouveau</option>
                  <option value="CONTACTE">Contacté</option>
                  <option value="DEVIS_ENVOYE">Devis envoyé</option>
                  <option value="CONFIRME">Confirmé</option>
                  <option value="PERDU">Perdu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes internes</label>
                <textarea
                  name="adminNotes"
                  defaultValue={quote.adminNotes || ''}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#06245F] focus:ring-1 focus:ring-[#06245F]"
                  placeholder="Notes privées sur l'échange avec le client..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#E0A01C] px-6 py-3 font-semibold text-white transition hover:opacity-90 active:scale-95 sm:w-auto"
              >
                Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}