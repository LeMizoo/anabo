import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminDemandesPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/login')
  }

  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#06245F]">Demandes de devis</h1>
            <p className="mt-2 text-gray-600">
              Connecté en tant que <strong>{session.user?.name}</strong> ({session.user?.email})
            </p>
          </div>
          <form action={async () => {
            'use server'
            const { signOut } = await import('@/lib/auth')
            await signOut({ redirectTo: '/admin/login' })
          }}>
            <button className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
              Déconnexion
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Circuit</th>
                <th className="px-4 py-3">Voyageurs</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Aucune demande pour le moment.
                  </td>
                </tr>
              )}
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{q.reference}</td>
                  <td className="px-4 py-3">{new Date(q.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{q.firstName} {q.lastName}</div>
                    <div className="text-xs text-gray-500">{q.country || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div>{q.email}</div>
                    <div>{q.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {q.circuitTitle || q.circuitSlug || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {q.adults} ad. / {q.children} enf.
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/demandes/${q.id}`} className="text-blue-600 hover:underline">
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}