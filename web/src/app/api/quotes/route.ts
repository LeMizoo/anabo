import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendQuoteEmails } from '@/lib/email'
import { sendPushToAdmins } from '@/lib/push'
import {
  calculateTripVehiclePrice,
  type VehicleEstimateSnapshot,
} from '@/lib/trip-pricing'

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
  regions: z.array(z.string().trim().max(120)).max(20).optional(),
  startDate: optionalDate,
  endDate: optionalDate,
  adults: z.coerce.number().int().min(1).max(20).default(2),
  children: z.coerce.number().int().min(0).max(20).default(0),
  vehicleCode: z.string().trim().max(120).optional().or(z.literal('')),
  vehicleLabel: z.string().trim().max(120).optional().or(z.literal('')),
  consecutiveCircuits: z.coerce.number().int().min(1).max(20).default(1),
  vehicleCount: z.coerce.number().int().min(1).max(20).default(1),
  message: z.string().trim().max(5000).optional().or(z.literal('')),
  // Champ piège anti-spam : invisible pour les humains, rempli par les robots.
  website: z.string().max(500).optional(),
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
      { status: 400 }
    )
  }

  const result = quoteSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Veuillez vérifier les champs du formulaire.',
        fields: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  const data = result.data

  if (data.website) {
    // Robot détecté : on simule un succès sans rien enregistrer.
    return NextResponse.json(
      { success: true, reference: null, estimate: null },
      { status: 201 },
    )
  }

  let startDate: Date | null
  let endDate: Date | null

  try {
    startDate = parseDate(data.startDate)
    endDate = parseDate(data.endDate)
  } catch {
    return NextResponse.json(
      { error: 'Une date du voyage est invalide.' },
      { status: 400 }
    )
  }

  if (startDate && endDate && endDate < startDate) {
    return NextResponse.json(
      {
        error:
          'La date de retour doit être postérieure ou égale à la date de départ.',
      },
      { status: 400 }
    )
  }

  // Jours inclus : du 1er au 5 = 5 jours (jour de départ et de retour comptés).
  const rentalDays =
    startDate && endDate
      ? Math.round(
          (endDate.getTime() - startDate.getTime()) / 86_400_000
        ) + 1
      : 0

  // Estimation indicative complète calculée côté serveur (véhicule + chauffeur + retour à vide).
  // Le snapshot détaillé reste côté serveur/admin/e-mail ; seul le total consolidé est exposé.
  let estimateSnapshot: VehicleEstimateSnapshot | null = null

  if (data.vehicleCode && rentalDays > 0) {
    try {
      const estimate = await calculateTripVehiclePrice({
        vehicleCode: data.vehicleCode,
        days: rentalDays,
        vehicleCount: data.vehicleCount,
        circuitSlug: data.circuitSlug || null,
        circuitTitle: data.circuitTitle || null,
        regions: data.regions || null,
      })

      if (estimate) {
        estimateSnapshot = {
          version: 3,
          calculatedAt: new Date().toISOString(),
          ...estimate,
        }
      }
    } catch (error) {
      console.error('[api/quotes] Estimate calculation failed:', error)
    }
  }

  const publicEstimate = estimateSnapshot
    ? {
        total: estimateSnapshot.total,
        currency: estimateSnapshot.currency,
        indicativeOnly: estimateSnapshot.indicativeOnly,
        days: estimateSnapshot.days,
        vehicleName: estimateSnapshot.vehicleName,
      }
    : null

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
        vehicleCode: data.vehicleCode || null,
        vehicleLabel: data.vehicleLabel || null,
        vehicleCount: data.vehicleCount,
        consecutiveCircuits: data.consecutiveCircuits,

        estimateDetails: estimateSnapshot
          ? JSON.stringify(estimateSnapshot)
          : null,
      },
      select: {
        id: true,
        reference: true,
        createdAt: true,
      },
    })

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
        vehicleCode: data.vehicleCode || null,
        vehicleLabel: data.vehicleLabel || null,
        vehicleCount: data.vehicleCount,
        consecutiveCircuits: data.consecutiveCircuits,
        vehicleEstimate: estimateSnapshot,
      })
    } catch (emailErr) {
      console.error(
        '[api/quotes] Email send failed:',
        emailErr
      )
    }

    // Notification push aux administrateurs (sendPushToAdmins n'échoue jamais).
    await sendPushToAdmins({
      title: `Nouvelle demande ${quote.reference}`,
      body: `${data.firstName} ${data.lastName}${data.circuitTitle ? ` — ${data.circuitTitle}` : ''}`,
      url: `/admin/demandes/${quote.id}`,
      tag: `quote-${quote.id}`,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Votre demande a bien été enregistrée.',
        reference: quote.reference,
        estimate: publicEstimate,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[api/quotes] Prisma error:', err)

    return NextResponse.json(
      {
        error:
          'Impossible d’enregistrer la demande pour le moment.',
      },
      { status: 500 }
    )
  }
}