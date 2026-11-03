'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search, X } from 'lucide-react'

export function QuoteFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const currentStatus = searchParams.get('status') || ''

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search) params.set('q', search)
    else params.delete('q')
    params.set('page', '1') // Retour à la page 1 lors d'une recherche
    router.push(`?${params.toString()}`)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) params.set('status', e.target.value)
    else params.delete('status')
    params.set('page', '1') // Retour à la page 1 lors d'un changement de filtre
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    router.push('/admin/demandes')
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
      {/* Barre de recherche */}
      <form onSubmit={handleSearch} role="search" className="relative flex flex-1 gap-2">
        <label htmlFor="quote-search" className="sr-only">Rechercher une demande</label>
        <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id="quote-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par référence, nom ou email..."
          className="min-w-0 w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Search aria-hidden="true" className="h-4 w-4" />
          <span className="hidden sm:inline">Rechercher</span>
        </button>
      </form>

      {/* Filtre par statut */}
      <label htmlFor="quote-status-filter" className="sr-only">Filtrer les demandes par statut</label>
      <select
        id="quote-status-filter"
        value={currentStatus}
        onChange={handleStatusChange}
        className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-48"
      >
        <option value="">Tous les statuts</option>
        <option value="NOUVEAU">Nouveau</option>
        <option value="CONTACTE">Contacté</option>
        <option value="DEVIS_ENVOYE">Devis envoyé</option>
        <option value="CONFIRME">Confirmé</option>
        <option value="PERDU">Perdu</option>
      </select>
      {(search || currentStatus) && (
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <X aria-hidden="true" className="h-4 w-4" />
          Effacer
        </button>
      )}
    </div>
  )
}