import { formatMgDateTime, formatTimestamp, formatTripDate } from '@/lib/datetime'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Archive, ArchiveRestore, ChevronLeft, ChevronRight } from 'lucide-react'
import { StatusSelect } from '@/components/admin/StatusSelect'
import { QuoteFilters } from '@/components/admin/QuoteFilters'
import { BulkSubmitButton, ConfirmSubmitButton, SelectAllCheckbox } from '@/components/admin/BulkSelection'
import { Prisma } from '@/generated/prisma/client'
import { QUOTE_STATUSES, isQuoteStatus, quoteStatusLabel } from '@/lib/quote-status'
import { ARCHIVE_RULES, NOT_ARCHIVED, archiveRuleWhere } from '@/lib/quote-archive'
import { archiveQuotes, unarchiveQuotes } from '@/app/admin/actions'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 10
const FOLLOW_UP_DAYS = 7
const BULK_FORM_ID = 'bulk-archive-form'

type Props = {
  searchParams: Promise<{ page?: string; q?: string; status?: string; sort?: string; suivi?: string; vue?: string }>
}

/** Numéros de pages à afficher : 1 … 4 5 6 … 12 */
function pageWindow(current: number, total: number): (number | '…')[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total))
  const sorted = [...pages].sort((a, b) => a - b)
  const out: (number | '…')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…')
    out.push(p)
  })
  return out
}

export default async function AdminDemandesPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { page, q, status, sort, suivi, vue } = await searchParams
  const archivesView = vue === 'archives'
  const requestedPage = Math.max(1, Number(page) || 1)
  const search = (q || '').trim().slice(0, 100)
  const sortMode = sort === 'depart' ? 'depart' : 'recent'
  const followUp = !archivesView && suivi === 'relance'
  const depositView = !archivesView && suivi === 'acompte'
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
  const scopeWhere: Prisma.QuoteRequestWhereInput = archivesView ? { archivedAt: { not: null } } : NOT_ARCHIVED
  const baseWhere: Prisma.QuoteRequestWhereInput = { ...searchWhere, ...scopeWhere }

  const followUpWhere: Prisma.QuoteRequestWhereInput = { status: 'DEVIS_ENVOYE', quoteSentAt: { lt: followUpLimit } }
  const depositWhere: Prisma.QuoteRequestWhereInput = { status: 'CONFIRME', depositPaidAt: null }

  const whereClause: Prisma.QuoteRequestWhereInput = {
    ...baseWhere,
    ...(followUp ? followUpWhere : depositView ? depositWhere : isQuoteStatus(status) ? { status } : {}),
  }

  const orderBy: Prisma.QuoteRequestOrderByWithRelationInput[] = archivesView
    ? [{ archivedAt: 'desc' }]
    : sortMode === 'depart'
      ? [{ startDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }]
      : [{ createdAt: 'desc' }]

  const [totalQuotes, statusGroups, totalAll, followUpCount, depositCount, archivedCount, ruleCounts] = await Promise.all([
    prisma.quoteRequest.count({ where: whereClause }),
    prisma.quoteRequest.groupBy({ by: ['status'], where: baseWhere, _count: { status: true } }),
    prisma.quoteRequest.count({ where: baseWhere }),
    prisma.quoteRequest.count({ where: { ...searchWhere, ...NOT_ARCHIVED, ...followUpWhere } }),
    prisma.quoteRequest.count({ where: { ...searchWhere, ...NOT_ARCHIVED, ...depositWhere } }),
    prisma.quoteRequest.count({ where: { ...searchWhere, archivedAt: { not: null } } }),
    Promise.all(ARCHIVE_RULES.map((rule) => prisma.quoteRequest.count({ where: archiveRuleWhere(rule.value) }))),
  ])

  const totalPages = Math.max(1, Math.ceil(totalQuotes / ITEMS_PER_PAGE))
  const currentPage = Math.min(requestedPage, totalPages)
  const quotes = await prisma.quoteRequest.findMany({
    where: whereClause,
    orderBy,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  })

  const countFor = (value: string) => statusGroups.find((group) => group.status === value)?._count.status || 0

  const buildUrl = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams()
    const current: Record<string, string | undefined> = {
      vue: archivesView ? 'archives' : undefined,
      q: search || undefined,
      status: isQuoteStatus(status) ? status : undefined,
      sort: sortMode === 'depart' ? 'depart' : undefined,
      suivi: followUp ? 'relance' : depositView ? 'acompte' : undefined,
      page: currentPage > 1 ? String(currentPage) : undefined,
    }
    for (const [key, value] of Object.entries({ ...current, ...changes })) {
      if (value && !(key === 'page' && value === '1')) params.set(key, value)
    }
    const query = params.toString()
    return `/admin/demandes${query ? `?${query}` : ''}`
  }
  const returnTo = buildUrl({})

  const tabs = [
    {
      label: 'Toutes',
      count: archivesView ? null : totalAll,
      href: buildUrl({ vue: null, status: null, suivi: null, page: null }),
      active: !archivesView && !followUp && !depositView && !isQuoteStatus(status),
    },
    ...QUOTE_STATUSES.map((item) => ({
      label: item.label,
      count: archivesView ? null : countFor(item.value),
      href: buildUrl({ vue: null, status: item.value, suivi: null, page: null }),
      active: !archivesView && !followUp && !depositView && status === item.value,
    })),
    { label: `À relancer (+${FOLLOW_UP_DAYS} j)`, count: followUpCount, href: buildUrl({ vue: null, status: null, suivi: 'relance', page: null }), active: followUp },
    { label: 'Acompte en attente', count: depositCount, href: buildUrl({ vue: null, status: null, suivi: 'acompte', page: null }), active: depositView },
    { label: 'Archivées', count: archivedCount, href: buildUrl({ vue: 'archives', status: null, suivi: null, page: null }), active: archivesView, archive: true },
  ]

  const exportParams = new URLSearchParams({
    ...(search ? { q: search } : {}),
    ...(isQuoteStatus(status) && !followUp ? { status } : {}),
    ...(archivesView ? { archives: '1' } : {}),
  }).toString()

  const firstItem = totalQuotes === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const lastItem = Math.min(currentPage * ITEMS_PER_PAGE, totalQuotes)

  const badges = (quote: (typeof quotes)[number]) => {
    const out: { label: string; cls: string }[] = []
    if (quote.status === 'DEVIS_ENVOYE' && quote.quoteSentAt && quote.quoteSentAt < followUpLimit)
      out.push({ label: 'À relancer', cls: 'bg-orange-100 text-orange-800' })
    if (quote.status === 'CONFIRME' && !quote.depositPaidAt) out.push({ label: 'Acompte en attente', cls: 'bg-blue-100 text-blue-800' })
    if (quote.status === 'CONFIRME' && quote.depositPaidAt) out.push({ label: 'Acompte reçu', cls: 'bg-green-100 text-green-800' })
    if (!quote.archivedAt && quote.status === 'NOUVEAU' && Date.now() - quote.createdAt.getTime() > 86_400_000)
      out.push({ label: '+24 h', cls: 'bg-red-100 text-red-800' })
    return out
  }

  const rowAction = (quote: (typeof quotes)[number]) =>
    quote.archivedAt ? (
      <form action={unarchiveQuotes}>
        <input type="hidden" name="ids" value={quote.id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button type="submit" title="Désarchiver" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
          <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
          <span>Désarchiver</span>
        </button>
      </form>
    ) : (
      <form action={archiveQuotes}>
        <input type="hidden" name="ids" value={quote.id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button type="submit" title="Archiver" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
          <Archive className="h-4 w-4" aria-hidden="true" />
          <span>Archiver</span>
        </button>
      </form>
    )

  const checkbox = (quote: (typeof quotes)[number]) => (
    <input
      type="checkbox"
      name="ids"
      value={quote.id}
      form={BULK_FORM_ID}
      data-bulk
      aria-label={`Sélectionner ${quote.reference}`}
      className="h-4 w-4 rounded border-gray-300 text-blue-700"
    />
  )

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{archivesView ? 'Demandes archivées' : 'Demandes de devis'}</h1>
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

      <nav aria-label="Filtrer les demandes" className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={tab.active ? 'page' : undefined}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              tab.active
                ? 'border-blue-900 bg-blue-900 text-white'
                : tab.archive
                  ? 'border-dashed border-gray-400 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.archive && <Archive className="h-3.5 w-3.5" aria-hidden="true" />}
            {tab.label}
            {tab.count !== null && <span className={tab.active ? 'text-blue-100' : 'text-gray-400'}>({tab.count})</span>}
          </Link>
        ))}
      </nav>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <QuoteFilters />
        </div>
        {!archivesView && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500">Trier :</span>
            <Link
              href={buildUrl({ sort: null, page: null })}
              className={`rounded-lg px-3 py-1.5 font-medium ${sortMode === 'recent' ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'}`}
            >
              Plus récentes
            </Link>
            <Link
              href={buildUrl({ sort: 'depart', page: null })}
              className={`rounded-lg px-3 py-1.5 font-medium ${sortMode === 'depart' ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'}`}
            >
              Départ le plus proche
            </Link>
          </div>
        )}
      </div>

      {!archivesView && (
        <details className="group mb-4 rounded-xl border border-gray-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-gray-800">
            <span className="inline-flex items-center gap-2">
              <Archive className="h-4 w-4 text-gray-500" aria-hidden="true" />
              Archivage rapide
              <span className="font-normal text-gray-500">
                ({ruleCounts.reduce((a, b) => a + b, 0)} demande(s) archivable(s))
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400 transition group-open:rotate-90" aria-hidden="true" />
          </summary>
          <div className="grid gap-3 border-t border-gray-100 p-4 md:grid-cols-3">
            {ARCHIVE_RULES.map((rule, i) => (
              <form key={rule.value} action={archiveQuotes} className="flex flex-col justify-between gap-3 rounded-lg bg-gray-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {rule.label} <span className="font-normal text-gray-500">({ruleCounts[i]})</span>
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">{rule.help}</p>
                </div>
                <input type="hidden" name="rule" value={rule.value} />
                <input type="hidden" name="returnTo" value={buildUrl({ page: null })} />
                <ConfirmSubmitButton
                  label={`Archiver ${ruleCounts[i]} demande(s)`}
                  confirmMessage={`Archiver ${ruleCounts[i]} demande(s) : « ${rule.label} » ? Elles resteront consultables dans l’onglet Archivées.`}
                  disabled={ruleCounts[i] === 0}
                />
              </form>
            ))}
          </div>
        </details>
      )}

      {/* Formulaire des actions groupées : les cases à cocher y sont rattachées par l’attribut form. */}
      <form
        id={BULK_FORM_ID}
        action={archivesView ? unarchiveQuotes : archiveQuotes}
        className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm"
      >
        <input type="hidden" name="returnTo" value={returnTo} />
        <label className="inline-flex items-center gap-2 text-gray-600 md:hidden">
          <SelectAllCheckbox /> Tout sélectionner
        </label>
        <p className="text-gray-600">
          {totalQuotes === 0 ? 'Aucun résultat' : `${firstItem}–${lastItem} sur ${totalQuotes} demande(s)`}
        </p>
        <BulkSubmitButton formId={BULK_FORM_ID} label={archivesView ? 'Désarchiver la sélection' : 'Archiver la sélection'} />
      </form>

      {/* Ordinateur : tableau compact, sans défilement horizontal à partir de 1024 px */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed text-left text-sm text-gray-600">
            <colgroup>
              <col className="w-10" />
              <col className="w-[24%]" />
              <col className="w-[22%]" />
              <col />
              <col className="w-40" />
              <col className="w-28" />
            </colgroup>
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-3 py-3">
                  <SelectAllCheckbox />
                </th>
                <th className="px-3 py-3" title="Heure de Madagascar (GMT+3)">Demande · reçue (GMT+3)</th>
                <th className="px-3 py-3">Client</th>
                <th className="px-3 py-3">Voyage</th>
                <th className="px-3 py-3">Statut</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    {archivesView ? 'Aucune demande archivée.' : 'Aucune demande ne correspond à ces critères.'}
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="align-top hover:bg-gray-50">
                    <td className="px-3 py-3">{checkbox(quote)}</td>
                    <td className="px-3 py-3">
                      <Link href={`/admin/demandes/${quote.id}`} className="block truncate font-semibold text-gray-900 hover:text-blue-700 hover:underline" title={quote.reference}>
                        {quote.reference}
                      </Link>
                      <span className="block text-xs text-gray-500" title={formatTimestamp(quote.createdAt, 'fr')}>
                        {formatMgDateTime(quote.createdAt, 'fr')}
                      </span>
                      {quote.archivedAt && (
                        <span className="block text-xs text-gray-400" title={quote.archivedBy || ''}>
                          Archivée le {formatMgDateTime(quote.archivedAt, 'fr')}
                        </span>
                      )}
                      {badges(quote).length > 0 && (
                        <span className="mt-1 flex flex-wrap gap-1">
                          {badges(quote).map((b) => (
                            <span key={b.label} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.cls}`}>
                              {b.label}
                            </span>
                          ))}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="block truncate font-medium text-gray-900">
                        {quote.firstName} {quote.lastName}
                      </span>
                      <span className="block truncate text-xs text-gray-500" title={quote.email}>
                        {quote.email}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block truncate text-gray-800" title={quote.circuitTitle || quote.circuitSlug || ''}>
                        {quote.circuitTitle || quote.circuitSlug || '—'}
                      </span>
                      <span className="block text-xs text-gray-500">
                        Départ {formatTripDate(quote.startDate)}
                        {quote.selectedDurationDays ? ` · ${quote.selectedDurationDays} j` : ''} · {quote.adults} ad.
                        {quote.children ? ` / ${quote.children} enf.` : ''}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {quote.archivedAt ? (
                        <span className="text-sm text-gray-700">{quoteStatusLabel(quote.status)}</span>
                      ) : (
                        <StatusSelect quoteId={quote.id} currentStatus={quote.status} />
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col items-end gap-1">
                        <Link href={`/admin/demandes/${quote.id}`} className="rounded-md px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                          Ouvrir
                        </Link>
                        {rowAction(quote)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile : cartes */}
      <ul className="space-y-3 md:hidden">
        {quotes.length === 0 && (
          <li className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            {archivesView ? 'Aucune demande archivée.' : 'Aucune demande ne correspond à ces critères.'}
          </li>
        )}
        {quotes.map((quote) => (
          <li key={quote.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="pt-0.5">{checkbox(quote)}</div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/demandes/${quote.id}`} className="block truncate font-semibold text-gray-900">
                  {quote.reference}
                </Link>
                <p className="text-xs text-gray-500">{formatMgDateTime(quote.createdAt, 'fr')} (GMT+3)</p>
                <p className="mt-2 truncate text-sm font-medium text-gray-900">
                  {quote.firstName} {quote.lastName}
                </p>
                <p className="truncate text-xs text-gray-500">{quote.email}</p>
                <p className="mt-1 truncate text-sm text-gray-700">{quote.circuitTitle || quote.circuitSlug || '—'}</p>
                <p className="text-xs text-gray-500">
                  Départ {formatTripDate(quote.startDate)} · {quote.adults} ad.{quote.children ? ` / ${quote.children} enf.` : ''}
                </p>
                {badges(quote).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {badges(quote).map((b) => (
                      <span key={b.label} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.cls}`}>
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  {quote.archivedAt ? (
                    <span className="text-sm text-gray-700">{quoteStatusLabel(quote.status)}</span>
                  ) : (
                    <StatusSelect quoteId={quote.id} currentStatus={quote.status} />
                  )}
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/demandes/${quote.id}`} className="rounded-md px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                      Ouvrir
                    </Link>
                    {rowAction(quote)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-gray-600">
            Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <Link
              href={buildUrl({ page: String(currentPage - 1) })}
              aria-disabled={currentPage <= 1}
              aria-label="Page précédente"
              className={`inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-medium ${
                currentPage <= 1 ? 'pointer-events-none bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Précédent</span>
            </Link>
            {pageWindow(currentPage, totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`gap-${i}`} className="px-1 text-gray-400">…</span>
              ) : (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  aria-current={p === currentPage ? 'page' : undefined}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium ${
                    p === currentPage ? 'border-blue-900 bg-blue-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </Link>
              ),
            )}
            <Link
              href={buildUrl({ page: String(currentPage + 1) })}
              aria-disabled={currentPage >= totalPages}
              aria-label="Page suivante"
              className={`inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-medium ${
                currentPage >= totalPages ? 'pointer-events-none bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      )}
    </div>
  )
}
