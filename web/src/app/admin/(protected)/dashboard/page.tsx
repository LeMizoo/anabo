import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ArrowRight, FileText, CheckCircle, Clock, TrendingUp, CalendarDays, BellRing } from 'lucide-react'
import DashboardCharts from './DashboardCharts'
import { quoteStatusColor, quoteStatusLabel } from '@/lib/quote-status'

export const dynamic = 'force-dynamic'

const DAY = 86_400_000

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const now = new Date()
  const today = new Date(now.toISOString().slice(0, 10) + 'T00:00:00.000Z')
  const in60Days = new Date(today.getTime() + 60 * DAY)
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const twelveMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1))

  const [
    totalQuotes, newQuotes, thisMonth, confirmedCount, lostCount,
    toReply, toFollowUp, upcoming, recentQuotes, lastYear, statusCounts,
  ] = await Promise.all([
    prisma.quoteRequest.count(),
    prisma.quoteRequest.count({ where: { status: 'NOUVEAU' } }),
    prisma.quoteRequest.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.quoteRequest.count({ where: { status: 'CONFIRME' } }),
    prisma.quoteRequest.count({ where: { status: 'PERDU' } }),
    prisma.quoteRequest.findMany({
      where: { status: 'NOUVEAU' },
      orderBy: { createdAt: 'asc' },
      take: 5,
      select: { id: true, reference: true, firstName: true, lastName: true, createdAt: true },
    }),
    prisma.quoteRequest.findMany({
      where: { status: 'DEVIS_ENVOYE', quoteSentAt: { lt: new Date(now.getTime() - 7 * DAY) } },
      orderBy: { quoteSentAt: 'asc' },
      take: 5,
      select: { id: true, reference: true, firstName: true, lastName: true, quoteSentAt: true },
    }),
    prisma.quoteRequest.findMany({
      where: { status: { in: ['CONFIRME', 'DEVIS_ENVOYE'] }, startDate: { gte: today, lte: in60Days } },
      orderBy: { startDate: 'asc' },
      take: 6,
      select: { id: true, reference: true, firstName: true, lastName: true, startDate: true, status: true, circuitTitle: true, adults: true, children: true },
    }),
    prisma.quoteRequest.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.quoteRequest.findMany({ where: { createdAt: { gte: twelveMonthsAgo } }, select: { createdAt: true } }),
    prisma.quoteRequest.groupBy({ by: ['status'], _count: { status: true } }),
  ])

  // 12 derniers mois, dans l'ordre chronologique (mois + année).
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1))
    const count = lastYear.filter(
      (q) => q.createdAt.getUTCFullYear() === d.getUTCFullYear() && q.createdAt.getUTCMonth() === d.getUTCMonth(),
    ).length
    return { name: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit', timeZone: 'UTC' }), demandes: count }
  })

  const statusData = statusCounts.map((item) => ({ name: item.status, value: item._count.status }))
  const decided = confirmedCount + lostCount
  const conversion = decided > 0 ? Math.round((confirmedCount / decided) * 100) : null
  const ageLabel = (date: Date) => {
    const days = Math.floor((now.getTime() - date.getTime()) / DAY)
    return days === 0 ? "aujourd'hui" : `il y a ${days} j`
  }

  const cards = [
    { label: 'Total des demandes', value: totalQuotes, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: 'Ce mois-ci', value: thisMonth, icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Nouvelles (à traiter)', value: newQuotes, icon: Clock, color: 'bg-orange-50 text-orange-600' },
    {
      label: 'Taux de conversion',
      value: conversion === null ? '—' : `${conversion} %`,
      hint: `${confirmedCount} confirmé(s) / ${decided} décidé(s)`,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Bienvenue, {session.user?.name || 'Admin'}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/planning" className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <CalendarDays className="w-4 h-4" /> Planning
          </Link>
          <Link href="/admin/demandes" className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
            Voir toutes les demandes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {cards.map((card) => (
          <div key={card.label} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className={`rounded-lg p-4 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              {card.hint && <p className="text-xs text-gray-400">{card.hint}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <BellRing className="h-5 w-5 text-orange-500" /> À répondre
          </h2>
          {toReply.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune nouvelle demande en attente. 👍</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {toReply.map((q) => (
                <li key={q.id} className="flex justify-between gap-2">
                  <Link href={`/admin/demandes/${q.id}`} className="font-medium text-blue-700 hover:underline">
                    {q.firstName} {q.lastName}
                  </Link>
                  <span className={Date.now() - q.createdAt.getTime() > DAY ? 'font-semibold text-red-600' : 'text-gray-500'}>
                    {ageLabel(q.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center justify-between gap-2 text-lg font-semibold text-gray-900">
            <span className="flex items-center gap-2"><Clock className="h-5 w-5 text-purple-500" /> Devis à relancer</span>
            <Link href="/admin/demandes?suivi=relance" className="text-sm font-medium text-blue-600 hover:underline">Tout voir</Link>
          </h2>
          {toFollowUp.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun devis envoyé depuis plus de 7 jours sans réponse.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {toFollowUp.map((q) => (
                <li key={q.id} className="flex justify-between gap-2">
                  <Link href={`/admin/demandes/${q.id}`} className="font-medium text-blue-700 hover:underline">
                    {q.firstName} {q.lastName}
                  </Link>
                  <span className="text-gray-500">envoyé {q.quoteSentAt ? ageLabel(q.quoteSentAt) : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center justify-between gap-2 text-lg font-semibold text-gray-900">
            <span className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-green-600" /> Départs (60 j)</span>
            <Link href="/admin/planning" className="text-sm font-medium text-blue-600 hover:underline">Planning</Link>
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun départ prévu dans les 60 prochains jours.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {upcoming.map((q) => (
                <li key={q.id} className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/admin/demandes/${q.id}`} className="font-medium text-blue-700 hover:underline">
                      {q.firstName} {q.lastName}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {q.startDate?.toLocaleDateString('fr-FR')} · {q.adults + q.children} pers.
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${quoteStatusColor(q.status)}`}>
                    {quoteStatusLabel(q.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <DashboardCharts data={chartData} statusData={statusData} />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Dernières demandes reçues</h2>
          <Link href="/admin/demandes" className="text-sm font-medium text-blue-600 hover:underline">Tout voir</Link>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Référence</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Date</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentQuotes.map((quote) => (
                <tr key={quote.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{quote.reference}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{quote.firstName} {quote.lastName}</div>
                    <div className="text-xs text-gray-500">{quote.country || '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${quoteStatusColor(quote.status)}`}>
                      {quoteStatusLabel(quote.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/demandes/${quote.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                    >
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              ))}
              {recentQuotes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucune demande pour le moment.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
