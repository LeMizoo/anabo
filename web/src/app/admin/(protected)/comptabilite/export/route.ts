import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-access'
import { getAccounting } from '@/lib/accounting'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function csvCell(value: unknown) {
  if (value === null || value === undefined) return ''
  let text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value)
  // Neutralise les formules Excel (injection CSV).
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

/** Export CSV de la comptabilité d'une année (SUPER_ADMIN). */
export async function GET(request: Request) {
  const user = await getCurrentAdmin()
  if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const year = Number(new URL(request.url).searchParams.get('annee')) || new Date().getUTCFullYear()
  if (year < 2000 || year > 2100) return NextResponse.json({ error: 'Année invalide' }, { status: 400 })
  const data = await getAccounting(year)

  const header = ['Date', 'Référence', 'Client', 'Circuit', 'Devise', 'Montant total', 'Acompte', 'Acompte reçu le', 'Solde', 'Solde reçu le', 'Encaissé', 'Reste à encaisser', 'Archivé']
  const rows = data.trips.map((t) => [
    t.date, t.reference, t.client, t.circuit, t.currency, t.total, t.total === null ? null : t.deposit, t.depositPaidAt,
    t.total === null ? null : t.balance, t.balancePaidAt, t.collected, t.remaining, t.archived ? 'oui' : 'non',
  ])
  const csv = '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="comptabilite-${year}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
