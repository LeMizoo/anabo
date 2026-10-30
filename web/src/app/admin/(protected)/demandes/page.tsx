import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatusSelect } from '@/components/admin/StatusSelect'
import { QuoteFilters } from '@/components/admin/QuoteFilters'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 10

type Props = {
  searchParams: Promise<{ page?: string, q?: string, status?: string }>
}

export default async function AdminDemandesPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { page, q, status } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  const whereClause: Prisma.QuoteRequestWhereInput = {}
  
  if (q) {
    whereClause.OR = [
      { reference: { contains: q } },
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
    ]
  }
  
  if (status) {
    whereClause.status = status as any
  }

  const [quotes, totalQuotes] = await Promise.all([
    prisma.quoteRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.quoteRequest.count({ where: whereClause }),
  ])

  const totalPages = Math.ceil(totalQuotes / ITEMS_PER_PAGE)

  const buildPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    params.set('page', String(newPage))
    return `/admin/demandes?${params.toString()}`
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes de devis</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connecté en tant que <strong>{session.user?.name}</strong> ({session.user?.email})
          </p>
        </div>
      </div>

      <QuoteFilters />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Référence</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Client</th>
                <th className="px-4 py-3 whitespace-nowrap">Circuit</th>
                <th className="px-4 py-3 whitespace-nowrap">Voyageurs</th>
                <th className="px-4 py-3 whitespace-nowrap">Statut</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Aucune demande ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{quote.reference}</td>
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
                      <StatusSelect quoteId={quote.id} currentStatus={quote.status} />
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

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-600">
            Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
            {' '}({totalQuotes} résultats)
          </p>
          <div className="flex gap-2">
            <Link
              href={buildPaginationUrl(currentPage - 1)}
              className={`rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition ${
                currentPage <= 1
                  ? 'pointer-events-none bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Précédent
            </Link>
            <Link
              href={buildPaginationUrl(currentPage + 1)}
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
  )
}