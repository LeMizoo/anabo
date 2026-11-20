import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAdminAlerts } from '@/lib/admin-alerts'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Compteur de la cloche (rafraîchi régulièrement par le navigateur).
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  return NextResponse.json(await getAdminAlerts(), { headers: { 'Cache-Control': 'no-store' } })
}
