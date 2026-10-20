import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

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
      },
      select: {
        reference: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Votre demande a bien été enregistrée.',
        reference: quote.reference,
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { error: 'Impossible d’enregistrer la demande pour le moment.' },
      { status: 500 },
    )
  }
}
