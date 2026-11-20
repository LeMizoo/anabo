import type { QuoteStatus } from '@/generated/prisma/enums'

export const QUOTE_STATUSES: { value: QuoteStatus; label: string; color: string }[] = [
  { value: 'NOUVEAU', label: 'Nouveau', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTACTE', label: 'Contacté', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'DEVIS_ENVOYE', label: 'Devis envoyé', color: 'bg-purple-100 text-purple-800' },
  { value: 'CONFIRME', label: 'Confirmé', color: 'bg-green-100 text-green-800' },
  { value: 'PERDU', label: 'Perdu', color: 'bg-red-100 text-red-800' },
]

export function isQuoteStatus(value: unknown): value is QuoteStatus {
  return QUOTE_STATUSES.some((status) => status.value === value)
}

export function quoteStatusLabel(value: string) {
  return QUOTE_STATUSES.find((status) => status.value === value)?.label || value
}

export function quoteStatusColor(value: string) {
  return QUOTE_STATUSES.find((status) => status.value === value)?.color || 'bg-gray-100 text-gray-800'
}

/** Numéro au format international pour wa.me (chiffres uniquement). */
export function whatsappDigits(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '').replace(/^00/, '+')
  if (digits.startsWith('+')) return digits.slice(1)
  // Numéro malgache local (034…, 032…, 033…, 038…) → indicatif 261
  if (/^0\d{9}$/.test(digits)) return `261${digits.slice(1)}`
  return digits
}
