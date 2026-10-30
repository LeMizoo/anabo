import { createHmac, timingSafeEqual } from 'node:crypto'

function secret(): string {
  const s = process.env.AUTH_SECRET
  if (!s) throw new Error('AUTH_SECRET manquant')
  return s
}

export function signQuoteToken(quoteId: string): string {
  return createHmac('sha256', secret())
    .update(`quote-confirm:${quoteId}`)
    .digest('hex')
}

export function verifyQuoteToken(quoteId: string, token: string): boolean {
  if (!token) return false
  const expected = Buffer.from(signQuoteToken(quoteId))
  const given = Buffer.from(token)
  if (expected.length !== given.length) return false
  return timingSafeEqual(expected, given)
}