/**
 * Coordonnées officielles (validées le 25/11/2026).
 * - contact@anabo.mg : adresse générale de l'entreprise et expéditeur des e-mails (Resend).
 * - Vonjy, chauffeur-guide : e-mail direct, téléphone direct, WhatsApp.
 * Les valeurs des Réglages du site (Sanity) sont prioritaires ; celles-ci servent de repli
 * et d'unique source pour les e-mails automatiques.
 */
export const OFFICIAL_CONTACT = {
  companyName: 'ANABO Roadtrip Madagascar',
  companyEmail: 'contact@anabo.mg',
  driverGuideName: 'Vonjy',
  driverGuideEmail: 'mytrip.mada@gmail.com',
  driverGuidePhone: '+261 32 99 298 60',
  whatsapp: '+261 34 14 914 54',
  address: 'Itaosy, Antananarivo, Madagascar',
} as const

export const phoneDigits = (value: string) => value.replace(/\D/g, '')
/** Lien tel: au format international (+261…). */
export const telHref = (value: string) => `tel:+${phoneDigits(value)}`
/** Lien WhatsApp (wa.me attend uniquement des chiffres). */
export const whatsappHref = (value: string) => `https://wa.me/${phoneDigits(value)}`
