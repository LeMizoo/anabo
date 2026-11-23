import { prisma } from '@/lib/prisma'

export type PaymentSettingsData = {
  method: string
  phoneNumber: string
  accountHolder: string | null
  depositPercent: number
  instructions: string | null
  updatedAt: Date | null
  updatedBy: string | null
}

/** Valeurs par défaut (utilisées tant que rien n'est enregistré en base). */
export const DEFAULT_PAYMENT_SETTINGS: PaymentSettingsData = {
  method: 'Mobile Money',
  phoneNumber: '+261 32 99 298 60',
  accountHolder: null,
  depositPercent: 30,
  instructions: null,
  updatedAt: null,
  updatedBy: null,
}

/** Paramètres de paiement de l'acompte (ligne unique « default »). Ne lève jamais d'erreur. */
export async function getPaymentSettings(): Promise<PaymentSettingsData> {
  try {
    const row = await prisma.paymentSettings.findUnique({ where: { id: 'default' } })
    if (!row) return DEFAULT_PAYMENT_SETTINGS
    return {
      method: row.method,
      phoneNumber: row.phoneNumber,
      accountHolder: row.accountHolder,
      depositPercent: row.depositPercent,
      instructions: row.instructions,
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
    }
  } catch (error) {
    console.error('[paiement] Paramètres indisponibles, valeurs par défaut utilisées :', error)
    return DEFAULT_PAYMENT_SETTINGS
  }
}

/** Montant de l'acompte arrondi à l'unité supérieure. */
export function depositAmount(total: number | null | undefined, percent: number) {
  if (!total || total <= 0) return null
  return Math.ceil((total * percent) / 100)
}

export function formatAmount(amount: number, currency: string | null | undefined, locale = 'fr-FR') {
  const code = (currency || 'EUR').toUpperCase()
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${amount.toLocaleString(locale)} ${code}`
  }
}
