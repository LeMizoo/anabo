'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import type { AdminAlerts } from '@/lib/admin-alerts'
import { PushToggle } from './PushToggle'

const REFRESH_MS = 60_000

export function AlertBell({ initial }: { initial: AdminAlerts }) {
  const [alerts, setAlerts] = useState(initial)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/admin/alerts', { cache: 'no-store' })
      if (res.ok) setAlerts(await res.json())
    } catch {
      /* réseau indisponible : on garde la dernière valeur */
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(refresh, REFRESH_MS)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items = [
    { label: 'Nouvelles demandes à traiter', count: alerts.newRequests, href: '/admin/demandes?status=NOUVEAU' },
    { label: 'Devis à envoyer (clients contactés)', count: alerts.quotesToSend, href: '/admin/demandes?status=CONTACTE' },
    { label: 'Devis à relancer (+7 j)', count: alerts.quotesToFollowUp, href: '/admin/demandes?suivi=relance' },
    { label: 'Voyages qui se chevauchent (renfort)', count: alerts.capacityIssues, href: '/admin/planning' },
    { label: 'Acomptes en attente', count: alerts.depositsPending, href: '/admin/demandes?suivi=acompte' },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value)
          refresh()
        }}
        aria-label={`${alerts.total} action(s) à faire`}
        aria-expanded={open}
        className="relative rounded-full p-2 text-gray-300 transition hover:bg-gray-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {alerts.total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white">
            {alerts.total > 99 ? '99+' : alerts.total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-11 z-50 w-72 rounded-xl border border-gray-700 bg-gray-800 p-3 shadow-2xl">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Actions à faire</p>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-gray-100 hover:bg-gray-700"
                >
                  <span>{item.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.count > 0 ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                    {item.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-gray-700 pt-3">
            <PushToggle />
          </div>
        </div>
      )}
    </div>
  )
}
