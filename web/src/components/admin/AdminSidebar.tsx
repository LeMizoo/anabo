'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, LogOut, Home, Server, Database, ExternalLink, Users, Mail } from 'lucide-react'
import { signOut } from 'next-auth/react'

export function AdminSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname()

  const menuItems = [
    { label: 'Tableau de bord', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Demandes de devis', href: '/admin/demandes', icon: FileText },
  ]

  if (userRole === 'SUPER_ADMIN') {
    menuItems.push({ label: 'Utilisateurs', href: '/admin/utilisateurs', icon: Users })
  }

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col hidden md:flex shrink-0">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold tracking-tight text-white">ANABO</h2>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Administration</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}

        <div className="pt-6 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Outils externes</p>
        </div>

        {/* cPanel Simafri */}
        <a 
          href="https://manager.simafri.com/clientarea.php" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors rounded-lg group"
        >
          <Server className="w-5 h-5 text-gray-500 group-hover:text-white" />
          <span className="font-medium flex-1">cPanel (Simafri)</span>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Webmail Simafri (Lien générique qui ne périme pas) */}
        <a 
          href="https://amaretto.hostns.io:2096/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors rounded-lg group"
        >
          <Mail className="w-5 h-5 text-gray-500 group-hover:text-white" />
          <span className="font-medium flex-1">Webmail (anabo.mg)</span>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Sanity Studio */}
        <a 
          href="https://anabo-roadtrip.sanity.studio" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors rounded-lg group"
        >
          <Database className="w-5 h-5 text-gray-500 group-hover:text-white" />
          <span className="font-medium flex-1">Sanity Studio</span>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-2 mt-auto">
        <Link href="/fr" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
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
  )
}