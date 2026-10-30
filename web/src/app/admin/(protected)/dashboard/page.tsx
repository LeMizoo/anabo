import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ArrowRight, FileText, CheckCircle, Clock } from 'lucide-react'
import DashboardCharts from './DashboardCharts'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const [totalQuotes, newQuotes] = await Promise.all([
    prisma.quoteRequest.count(),
    prisma.quoteRequest.count({ where: { status: 'NOUVEAU' } })
  ])

  const recentQuotes = await prisma.quoteRequest.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  const allQuotes = await prisma.quoteRequest.findMany({ 
    select: { createdAt: true } 
  })
  
  const quotesByMonth = allQuotes.reduce((acc: Record<string, number>, quote) => {
    const month = new Date(quote.createdAt).toLocaleString('fr-FR', { month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  const chartData = Object.keys(quotesByMonth).map(month => ({
    name: month,
    demandes: quotesByMonth[month]
  }))

  const statusCounts = await prisma.quoteRequest.groupBy({
    by: ['status'],
    _count: { status: true },
  })

  const statusData = statusCounts.map(item => ({
    name: item.status,
    value: item._count.status
  }))

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Bienvenue, {session.user?.name || 'Admin'}</p>
        </div>
        <Link 
          href="/admin/demandes"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          Voir toutes les demandes
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total des demandes</p>
            <p className="text-3xl font-bold text-gray-900">{totalQuotes}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Nouvelles (à traiter)</p>
            <p className="text-3xl font-bold text-gray-900">{newQuotes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Système</p>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xl font-semibold text-gray-900">En ligne</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <DashboardCharts data={chartData} statusData={statusData} />

      {/* Dernières demandes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Dernières demandes reçues</h2>
          <Link href="/admin/demandes" className="text-sm text-blue-600 hover:underline font-medium">
            Tout voir
          </Link>
        </div>
        
        {/* Le conteneur scrollable pour mobile */}
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
                <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {quote.reference}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{quote.firstName} {quote.lastName}</div>
                    <div className="text-xs text-gray-500">{quote.country || '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${quote.status === 'NOUVEAU' ? 'bg-blue-100 text-blue-800' : ''}
                      ${quote.status === 'CONTACTE' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${quote.status === 'DEVIS_ENVOYE' ? 'bg-purple-100 text-purple-800' : ''}
                      ${quote.status === 'CONFIRME' ? 'bg-green-100 text-green-800' : ''}
                      ${quote.status === 'PERDU' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {quote.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/demandes/${quote.id}`} 
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              ))}
              {recentQuotes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucune demande pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}