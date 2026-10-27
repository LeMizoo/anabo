import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    )

    if (!isValidSignature) {
      return new Response('Invalid signature', { status: 401 })
    }

    if (!body?._type) {
      return new Response('Bad Request', { status: 400 })
    }

    // On revalide la page d'accueil (ou la page concernée)
    revalidatePath('/', 'layout') 

    return NextResponse.json({ status: 200, revalidated: true })
  } catch (err) {
    return new Response('Internal Server Error', { status: 500 })
  }
}