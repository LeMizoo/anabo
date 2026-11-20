import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatusSelect } from '@/components/admin/StatusSelect'
import { QuoteFilters } from '@/components/admin/QuoteFilters'
import { Prisma } from '@/generated/prisma/client'
import { QUOTE_STATUSES, isQuoteStatus } from '@/lib/quote-status'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 20
const FOLLOW_UP_DAYS = 7

type Props = {
  searchParams: Promise<{ page?: string; q?: string; status?: string; sort?: string; suivi?: string }>
}

function formatDate(date: Date | null) {
  return date ? new Date(date).toLocaleDateString('fr-FR') : '—'
}

export default async function AdminDemandesPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { page, q, status, sort, suivi } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE
  const search = (q || '').trim().slice(0, 100)
  const sortMode = sort === 'depart' ? 'depart' : 'recent'
  const followUp = suivi === 'relance'
  const followUpLimit = new Date(Date.now() - FOLLOW_UP_DAYS * 86_400_000)

  const searchWhere: Prisma.QuoteRequestWhereInput = search
    ? {
        OR: [
          { reference: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
          { circuitTitle: { contains: search } },
        ],
      }
    : {}

  const followUpWhere: Prisma.QuoteRequestWhereInput = {
    status: 'DEVIS_ENVOYE',
    quoteSentAt: { lt: followUpLimit },
  }

  const whereClause: Prisma.QuoteRequestWhereInput = {
    ...searchWhere,
    ...(followUp ? followUpWhere : isQuoteStatus(status) ? { status } : {}),
  }

  const orderBy: Prisma.QuoteRequestOrderByWithRelationInput[] =
    sortMode === 'depart'
      ? [{ startDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }]
      : [{ createdAt: 'desc' }]

  const [quotes, totalQuotes, statusGroups, totalAll, followUpCount] = await Promise.all([
    prisma.quoteRequest.findMany({ where: whereClause, orderBy, skip, take: ITEMS_PER_PAGE }),
    prisma.quoteRequest.count({ where: whereClause }),
    prisma.quoteRequest.groupBy({ by: ['status'], where: searchWhere, _count: { status: true } }),
    prisma.quoteRequest.count({ where: searchWhere }),
    prisma.quoteRequest.count({ where: { ...searchWhere, ...followUpWhere } }),
  ])

  const countFor = (value: string) =>
    statusGroups.find((group) => group.status === value)?._count.status || 0
  const totalPages = Math.max(1, Math.ceil(totalQuotes / ITEMS_PER_PAGE))

  const buildUrl = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams()
    const current: Record<string, string | undefined> = {
      q: search || undefined,
      status: isQuoteStatus(status) ? status : undefined,
      sort: sortMode === 'depart' ? 'depart' : undefined,
      suivi: followUp ? 'relance' : undefined,
    }
    for (const [key, value] of Object.entries({ ...current, ...changes })) {
      if (value) params.set(key, value)
    }
    const query = params.toString()
    return `/admin/demandes${query ? `?${query}` : ''}`
  }

  const tabs = [
    { label: 'Toutes', count: totalAll, href: buildUrl({ status: null, suivi: null, page: null }), active: !followUp && !isQuoteStatus(status) },
    ...QUOTE_STATUSES.map((item) => ({
      label: item.label,
      count: countFor(item.value),
      href: buildUrl({ status: item.value, suivi: null, page: null }),
      active: !followUp && status === item.value,
    })),
    { label: `À relancer (+${FOLLOW_UP_DAYS} j)`, count: followUpCount, href: buildUrl({ status: null, suivi: 'relance', page: null }), active: followUp },
  ]

  const exportParams = new URLSearchParams({
    ...(search ? { q: search } : {}),
    ...(isQuoteStatus(status) && !followUp ? { status } : {}),
  }).toString()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes de devis</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connecté en tant que <strong>{session.user?.name}</strong> ({session.user?.email})
          </p>
        </div>

        <a
          href={`/admin/demandes/export${exportParams ? `?${exportParams}` : ''}`}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Exporter en CSV ({totalQuotes})
        </a>
      </div>

      <nav aria-label="Filtrer par statut" className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={tab.active ? 'page' : undefined}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              tab.active
                ? 'border-blue-900 bg-blue-900 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label} <span className={tab.active ? 'text-blue-100' : 'text-gray-400'}>({tab.count})</span>
          </Link>
        ))}
      </nav>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <QuoteFilters />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Trier :</span>
          <Link
            href={buildUrl({ sort: null, page: null })}
            className={`rounded-lg px-3 py-1.5 font-medium ${sortMode === 'recent' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
          >
            Plus récentes
          </Link>
          <Link
            href={buildUrl({ sort: 'depart', page: null })}
            className={`rounded-lg px-3 py-1.5 font-medium ${sortMode === 'depart' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
          >
            Départ le plus proche
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Référence</th>
                <th className="px-4 py-3 whitespace-nowrap">Reçue le</th>
                <th className="px-4 py-3 whitespace-nowrap">Client</th>
                <th className="px-4 py-3 whitespace-nowrap">Circuit</th>
                <th className="px-4 py-3 whitespace-nowrap">Départ</th>
                <th className="px-4 py-3 whitespace-nowrap">Voyageurs</th>
                <th className="px-4 py-3 whitespace-nowrap">Statut</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Aucune demande ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => {
                  const toFollowUp =
                    quote.status === 'DEVIS_ENVOYE' && quote.quoteSentAt && quote.quoteSentAt < followUpLimit
                  const isNewAndOld =
                    quote.status === 'NOUVEAU' && Date.now() - quote.createdAt.getTime() > 86_400_000
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {quote.reference}
                        {toFollowUp && (
                          <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-800">À relancer</span>
                        )}
                        {isNewAndOld && (
                          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">+24 h</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(quote.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{quote.firstName} {quote.lastName}</div>
                        <div className="max-w-[170px] truncate text-xs text-gray-500" title={quote.email}>
                          {quote.email}
                        </div>
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3" title={quote.circuitTitle || quote.circuitSlug || ''}>
                        {quote.circuitTitle || quote.circuitSlug || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(quote.startDate)}
                        {quote.selectedDurationDays ? (
                          <span className="block text-xs text-gray-400">{quote.selectedDurationDays} j</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {quote.adults} ad. / {quote.children} enf.
                      </td>
                      <td className="px-4 py-3">
                        <StatusSelect quoteId={quote.id} currentStatus={quote.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/demandes/${quote.id}`} className="font-medium text-blue-600 hover:underline">
                          Ouvrir
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-600">
            Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>{' '}
            ({totalQuotes} résultats)
          </p>
          <div className="flex gap-2">
            <Link
              href={buildUrl({ page: String(currentPage - 1) })}
              aria-disabled={currentPage <= 1}
              className={`rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition ${
                currentPage <= 1 ? 'pointer-events-none bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Précédent
            </Link>
            <Link
              href={buildUrl({ page: String(currentPage + 1) })}
              aria-disabled={currentPage >= totalPages}
              className={`rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition ${
                currentPage >= totalPages ? 'pointer-events-none bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
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
