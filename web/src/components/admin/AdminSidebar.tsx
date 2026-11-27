'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, LogOut, Home, Server, Database, ExternalLink, Users, Mail, Menu, X, UserCircle, CircleDollarSign, CalendarDays, Car, Wallet, Calculator, type LucideIcon } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { AlertBell } from './AlertBell'
import type { AdminAlerts } from '@/lib/admin-alerts'

export function AdminSidebar({ userRole, alerts }: { userRole: string; alerts: AdminAlerts | null }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Un compte Chauffeur ne voit que ses voyages et son compte.
  const isDriver = userRole === 'CHAUFFEUR'
  const primaryItems = isDriver
    ? [{ label: 'Mes voyages', href: '/admin/planning', icon: CalendarDays }]
    : [
        { label: 'Tableau de bord', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Demandes de devis', href: '/admin/demandes', icon: FileText },
        { label: 'Planning', href: '/admin/planning', icon: CalendarDays },
        { label: 'Chauffeurs', href: '/admin/chauffeurs', icon: Car },
      ]

  const adminItems = userRole === 'SUPER_ADMIN' ? [
    { label: 'Comptabilité', href: '/admin/comptabilite', icon: Calculator },
    { label: 'Prix et véhicules', href: '/admin/prix', icon: CircleDollarSign },
    { label: 'Paiement et acompte', href: '/admin/paiement', icon: Wallet },
    { label: 'Utilisateurs', href: '/admin/utilisateurs', icon: Users },
  ] : []
  const accountItems = [{ label: 'Mon compte', href: '/admin/mon-compte', icon: UserCircle }]

  function renderItems(items: { label: string; href: string; icon: LucideIcon }[]) {
    return items.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
      const Icon = item.icon
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={closeMenu}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
            isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Icon className="h-5 w-5" />
          <span className="font-medium">{item.label}</span>
        </Link>
      )
    })
  }

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Bouton Burger (Mobile uniquement) */}
      <div className="md:hidden fixed top-4 left-4 z-50 print:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-white rounded-md shadow-md text-gray-700 hover:bg-gray-50"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay sombre (Mobile uniquement) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`print:hidden w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:static md:translate-x-0 shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">ANABO</h2>
              {alerts && <AlertBell initial={alerts} />}
            </div>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{isDriver ? 'Espace chauffeur' : 'Administration'}</p>
          </div>
          <button onClick={closeMenu} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-5 overflow-y-auto px-4">
          <section className="space-y-1">
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Espace de travail</p>
            {renderItems(primaryItems)}
          </section>

          {adminItems.length > 0 && <section className="space-y-1 border-t border-gray-800 pt-4">
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Administration</p>
            {renderItems(adminItems)}
          </section>}

          <section className="space-y-1 border-t border-gray-800 pt-4">
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Compte</p>
            {renderItems(accountItems)}
          </section>

          {!isDriver && <>
          <div className="border-t border-gray-800 pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Outils externes</p>
          </div>

          <a href="https://manager.simafri.com/clientarea.php" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors rounded-lg group">
            <Server className="w-5 h-5 text-gray-500 group-hover:text-white" />
            <span className="font-medium flex-1">cPanel (Simafri)</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <a href="https://amaretto.hostns.io:2096/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors rounded-lg group">
            <Mail className="w-5 h-5 text-gray-500 group-hover:text-white" />
            <span className="font-medium flex-1">Webmail (anabo.mg)</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <a href="https://anabo-roadtrip.sanity.studio" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors rounded-lg group">
            <Database className="w-5 h-5 text-gray-500 group-hover:text-white" />
            <span className="font-medium flex-1">Sanity Studio</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          </>}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2 mt-auto">
          <Link href="/fr" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
            <Home className="w-5 h-5" />
            <span className="font-medium">Retour au site</span>
          </Link>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-gray-800"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
