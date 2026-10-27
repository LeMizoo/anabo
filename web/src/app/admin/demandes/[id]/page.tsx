import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Nombre d'éléments par page
const ITEMS_PER_PAGE = 10

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminDemandesPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  // Récupération du numéro de page depuis l'URL (par défaut page 1)
  const { page } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)

  // Calcul des éléments à ignorer pour Prisma
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Récupération des données paginées et du total
  const [quotes, totalQuotes] = await Promise.all([
    prisma.quoteRequest.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.quoteRequest.count(),
  ])

  const totalPages = Math.ceil(totalQuotes / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[#06245F]">Demandes de devis</h1>
          <p className="text-sm text-gray-500">
            Connecté en tant que {session.user?.name || session.user?.email}
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Circuit</th>
                  <th className="px-4 py-3">Voyageurs</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Aucune demande pour le moment.
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{quote.reference}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{quote.firstName} {quote.lastName}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]" title={quote.email}>
                          {quote.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate" title={quote.circuitTitle || quote.circuitSlug || ''}>
                        {quote.circuitTitle || quote.circuitSlug || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {quote.adults} ad. / {quote.children} enf.
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/demandes/${quote.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-600">
              Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
              {' '}({totalQuotes} demandes au total)
            </p>
            <div className="flex gap-2">
              <Link
                href={`/admin/demandes?page=${currentPage - 1}`}
                className={`rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition ${
                  currentPage <= 1
                    ? 'pointer-events-none bg-gray-100 text-gray-400'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Précédent
              </Link>
              <Link
                href={`/admin/demandes?page=${currentPage + 1}`}
                className={`rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition ${
                  currentPage >= totalPages
                    ? 'pointer-events-none bg-gray-100 text-gray-400'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Suivant
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}