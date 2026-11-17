import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendQuoteEmails } from '@/lib/email'
import { calculateQuoteEstimate } from '@/lib/pricing'
import type { PricingMode } from '@/generated/prisma/enums'

export const runtime = 'nodejs'

const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide')
  .optional()
  .or(z.literal(''))

const quoteSchema = z.object({
  locale: z.enum(['fr', 'en', 'it']).default('fr'),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(191),
  phone: z.string().trim().min(3).max(40),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  circuitSlug: z.string().trim().max(191).optional().or(z.literal('')),
  circuitTitle: z.string().trim().max(191).optional().or(z.literal('')),
  startDate: optionalDate,
  endDate: optionalDate,
  adults: z.coerce.number().int().min(1).max(20).default(2),
  children: z.coerce.number().int().min(0).max(20).default(0),
  vehicleCode: z.string().trim().max(120).optional().or(z.literal('')),
  vehicleLabel: z.string().trim().max(120).optional().or(z.literal('')),
  pricingMode: z.enum(['DAILY_CAR', 'TOUR_INCLUDED']).optional(),
  packageId: z.string().trim().max(30).optional().or(z.literal('')),
  consecutiveCircuits: z.coerce.number().int().min(1).max(20).default(1),
  vehicleCount: z.coerce.number().int().min(1).max(20).default(1),
  message: z.string().trim().max(5000).optional().or(z.literal('')),
})

function parseDate(value?: string): Date | null {
  if (!value) return null

  const date = new Date(`${value}T00:00:00.000Z`)

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error('INVALID_DATE')
  }

  return date
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Le contenu envoyé est invalide.' },
      { status: 400 },
    )
  }

  const result = quoteSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Veuillez vérifier les champs du formulaire.',
        fields: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  const data = result.data

  let startDate: Date | null
  let endDate: Date | null

  try {
    startDate = parseDate(data.startDate)
    endDate = parseDate(data.endDate)
  } catch {
    return NextResponse.json(
      { error: 'Une date du voyage est invalide.' },
      { status: 400 },
    )
  }

  if (startDate && endDate && endDate < startDate) {
    return NextResponse.json(
      { error: 'La date de retour doit être postérieure ou égale à la date de départ.' },
      { status: 400 },
    )
  }

  const rentalDays = startDate && endDate
    ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000))
    : 0
  let estimateResult: Awaited<ReturnType<typeof calculateQuoteEstimate>> = null
  let selectedPackage: { id: string; name: string } | null = null
  try {
    if (data.packageId) {
      if (!data.pricingMode || !data.circuitSlug) return NextResponse.json({ error: 'Choisissez un mode de tarification valide pour ce package.' }, { status: 400 })
      selectedPackage = await prisma.pricingPackage.findFirst({
        where: {
          id: data.packageId,
          active: true,
          config: { circuitSlug: data.circuitSlug },
          OR: [{ scope: data.pricingMode }, { scope: 'BOTH' }],
        },
        select: { id: true, name: true },
      })
      if (!selectedPackage) return NextResponse.json({ error: 'Le package sélectionné n’est plus disponible.' }, { status: 400 })
    }
    if (data.pricingMode && data.circuitSlug) estimateResult = await calculateQuoteEstimate({
        circuitSlug: data.circuitSlug,
        pricingMode: data.pricingMode as PricingMode,
        vehicleCode: data.vehicleCode || undefined,
        vehicleLabel: data.vehicleLabel || undefined,
        packageId: selectedPackage?.id,
        adults: data.adults,
        children: data.children,
        days: rentalDays,
        consecutiveCircuits: data.consecutiveCircuits,
        vehicleCount: data.vehicleCount,
      })
  } catch (error) {
    console.error('[api/quotes] Estimate calculation failed:', error)
    return NextResponse.json({ error: 'Impossible de calculer le prix indicatif pour le moment.' }, { status: 503 })
  }
  const estimateDetails = estimateResult?.snapshot || null

  const reference =
    `AR-${Date.now().toString(36).toUpperCase()}-` +
    randomBytes(4).toString('hex').toUpperCase()

  try {
    const quote = await prisma.quoteRequest.create({
      data: {
        reference,
        locale: data.locale,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        country: data.country || null,
        circuitSlug: data.circuitSlug || null,
        circuitTitle: data.circuitTitle || null,
        startDate,
        endDate,
        adults: data.adults,
        children: data.children,
        message: data.message || null,
        estimateDetails: estimateDetails ? JSON.stringify(estimateDetails) : null,
        vehicleCode: data.vehicleCode || null,
        vehicleLabel: data.vehicleLabel || null,
        pricingMode: data.pricingMode || null,
        pricingPackageId: selectedPackage?.id || null,
        pricingPackageName: selectedPackage?.name || null,
        vehicleCount: data.vehicleCount,
        consecutiveCircuits: data.consecutiveCircuits,
      },
      select: {
        id: true,
        reference: true,
        createdAt: true,
      },
    })

    // Envoi des e-mails (ne bloque pas la réponse en cas d'échec Resend)
    try {
      await sendQuoteEmails({
        id: quote.id,
        reference: quote.reference,
        locale: data.locale,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        country: data.country || null,
        circuitSlug: data.circuitSlug || null,
        circuitTitle: data.circuitTitle || null,
        startDate,
        endDate,
        adults: data.adults,
        children: data.children,
        message: data.message || null,
        estimateDetails,
        vehicleCode: data.vehicleCode || null,
        vehicleLabel: data.vehicleLabel || null,
        pricingMode: data.pricingMode || null,
        pricingPackageName: selectedPackage?.name || null,
        vehicleCount: data.vehicleCount,
        consecutiveCircuits: data.consecutiveCircuits,
      })
    } catch (emailErr) {
      console.error('[api/quotes] Email send failed:', emailErr)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Votre demande a bien été enregistrée.',
        reference: quote.reference,
        estimate: estimateResult?.publicEstimate || null,
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[api/quotes] Prisma error:', err)
    return NextResponse.json(
      { error: 'Impossible d’enregistrer la demande pour le moment.' },
      { status: 500 },
    )
  }
}
