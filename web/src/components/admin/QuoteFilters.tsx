'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

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

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par référence, nom ou email..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button type="submit" className="hidden">Rechercher</button>
      </form>

      {/* Filtre par statut */}
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
      >
        <option value="">Tous les statuts</option>
        <option value="NOUVEAU">Nouveau</option>
        <option value="CONTACTE">Contacté</option>
        <option value="DEVIS_ENVOYE">Devis envoyé</option>
        <option value="CONFIRME">Confirmé</option>
        <option value="PERDU">Perdu</option>
      </select>
    </div>
  )
}