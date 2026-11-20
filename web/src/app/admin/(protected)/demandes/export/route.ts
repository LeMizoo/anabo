import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'
import { isQuoteStatus, quoteStatusLabel } from '@/lib/quote-status'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function csvCell(value: unknown) {
  if (value === null || value === undefined) return ''
  let text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value)
  // Neutralise les formules Excel (injection CSV).
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = (searchParams.get('q') || '').trim().slice(0, 100)
  const status = searchParams.get('status')

  const where: Prisma.QuoteRequestWhereInput = {}
  if (search) {
    where.OR = [
      { reference: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
      { circuitTitle: { contains: search } },
    ]
  }
  if (isQuoteStatus(status)) where.status = status

  const quotes = await prisma.quoteRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 5000,
    select: {
      reference: true, createdAt: true, status: true, locale: true,
      firstName: true, lastName: true, email: true, phone: true, country: true,
      circuitTitle: true, circuitSlug: true, startDate: true, endDate: true,
      adults: true, children: true, vehicleLabel: true, vehicleCount: true,
      selectedDurationDays: true, message: true,
    },
  })

  const header = [
    'Référence', 'Date', 'Statut', 'Langue', 'Prénom', 'Nom', 'E-mail', 'Téléphone', 'Pays',
    'Circuit', 'Départ', 'Retour', 'Adultes', 'Enfants', 'Véhicule', 'Nb véhicules',
    'Durée retenue (j)', 'Message',
  ]
  const rows = quotes.map((q) => [
    q.reference, q.createdAt, quoteStatusLabel(q.status), q.locale, q.firstName, q.lastName,
    q.email, q.phone, q.country, q.circuitTitle || q.circuitSlug, q.startDate, q.endDate,
    q.adults, q.children, q.vehicleLabel, q.vehicleCount, q.selectedDurationDays, q.message,
  ])

  // BOM UTF-8 + point-virgule : ouverture directe et correcte dans Excel (FR).
  const csv = '﻿' + [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')
  const date = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="demandes-anabo-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
