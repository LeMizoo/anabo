import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendQuoteEmails } from '@/lib/email'
import { estimateQuote, type QuoteEstimate } from '@/lib/pricing'

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
  // Tous les circuits choisis (principal + extensions) : leurs jours s'additionnent.
  circuitSlugs: z.array(z.string().trim().min(1).max(191)).max(20).optional(),
  startDate: optionalDate,
  endDate: optionalDate,
  adults: z.coerce.number().int().min(1).max(20).default(2),
  children: z.coerce.number().int().min(0).max(20).default(0),
  vehicleId: z.string().trim().max(30).optional().or(z.literal('')),
  season: z.enum(['dry', 'rainy']).optional().or(z.literal('')),
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

  // Estimation indicative : jours du circuit × tarif journalier du véhicule.
  // En cas d'échec de lecture Sanity, la demande est quand même enregistrée.
  let estimate: QuoteEstimate | null = null
  if (data.vehicleId) {
    // Durée et prix viennent de /admin/prix (véhicule + durée des circuits pour la saison),
    // jamais des dates saisies ni d'un total envoyé par le navigateur.
    const requestedSlugs = (
      data.circuitSlugs ?? (data.circuitSlug ? [data.circuitSlug] : [])
    ).filter((slug) => slug !== 'sur-mesure' && slug !== 'extensions')

    try {
      estimate = await estimateQuote({
        vehicleId: data.vehicleId,
        season: data.season || 'dry',
        circuitSlugs: requestedSlugs,
        locale: data.locale,
      })
    } catch (estimateError) {
      console.error('[api/quotes] Estimate failed:', estimateError)
    }
  }

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
        vehicleId: estimate?.vehicleId ?? null,
        vehicleName: estimate?.vehicleName ?? null,
        season: estimate?.season ?? null,
        daysMin: estimate?.daysMin ?? null,
        daysMax: estimate?.daysMax ?? null,
        dailyRate: estimate?.dailyRate ?? null,
        priceMin: estimate?.priceMin ?? null,
        priceMax: estimate?.priceMax ?? null,
      },
      select: {
        reference: true,
        createdAt: true,
      },
    })

    // Envoi des e-mails (ne bloque pas la réponse en cas d'échec Resend)
    try {
      await sendQuoteEmails({
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
      })
    } catch (emailErr) {
      console.error('[api/quotes] Email send failed:', emailErr)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Votre demande a bien été enregistrée.',
        reference: quote.reference,
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