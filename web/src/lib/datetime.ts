/**
 * Dates et heures du site.
 *
 * - Les horodatages (création d'une demande, acceptation, acompte…) sont stockés en UTC
 *   (= GMT) en base. Ils sont affichés à l'heure de Madagascar (GMT+3, sans heure d'été),
 *   avec l'équivalent GMT quand c'est utile au client.
 * - Les dates de voyage (startDate / endDate) sont des dates « calendaires » enregistrées
 *   à minuit UTC : elles sont toujours formatées en UTC pour ne jamais glisser d'un jour,
 *   quel que soit le fuseau du serveur d'hébergement.
 */

export const MADAGASCAR_TIME_ZONE = 'Indian/Antananarivo'
export const MADAGASCAR_UTC_OFFSET = 'GMT+3'

type Lang = 'fr' | 'en' | 'it'

export function intlLocale(locale?: string | null): string {
  return locale === 'en' ? 'en-GB' : locale === 'it' ? 'it-IT' : 'fr-FR'
}

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value)
}

/** Date de voyage (calendaire) : 12/03/2027. */
export function formatTripDate(
  value: Date | string | null | undefined,
  locale: string = 'fr',
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' },
): string {
  if (!value) return '—'
  const d = toDate(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(intlLocale(locale), { ...options, timeZone: 'UTC' })
}

/** Date seule d'un horodatage, à l'heure de Madagascar. */
export function formatMgDate(
  value: Date | string | null | undefined,
  locale: string = 'fr',
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' },
): string {
  if (!value) return '—'
  const d = toDate(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(intlLocale(locale), { ...options, timeZone: MADAGASCAR_TIME_ZONE })
}

/** Heure seule (HH:MM) à l'heure de Madagascar. */
export function formatMgTime(value: Date | string, locale: string = 'fr'): string {
  return toDate(value).toLocaleTimeString(intlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: MADAGASCAR_TIME_ZONE,
  })
}

/** Heure seule (HH:MM) en GMT / UTC. */
export function formatGmtTime(value: Date | string, locale: string = 'fr'): string {
  return toDate(value).toLocaleTimeString(intlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

/** « 25/11/2026 15:39 » à l'heure de Madagascar (sans libellé). */
export function formatMgDateTime(value: Date | string | null | undefined, locale: string = 'fr'): string {
  if (!value) return '—'
  const d = toDate(value)
  if (Number.isNaN(d.getTime())) return '—'
  return `${formatMgDate(d, locale)} ${formatMgTime(d, locale)}`
}

const LABELS: Record<Lang, { mg: string; at: string }> = {
  fr: { mg: 'heure de Madagascar', at: 'à' },
  en: { mg: 'Madagascar time', at: 'at' },
  it: { mg: 'ora del Madagascar', at: 'alle' },
}

/**
 * Horodatage complet avec fuseaux explicites :
 * « 25/11/2026 à 15:39 (heure de Madagascar, GMT+3) · 12:39 GMT »
 */
export function formatTimestamp(value: Date | string | null | undefined, locale: string = 'fr'): string {
  if (!value) return '—'
  const d = toDate(value)
  if (Number.isNaN(d.getTime())) return '—'
  const lang: Lang = locale === 'en' || locale === 'it' ? locale : 'fr'
  const l = LABELS[lang]
  return `${formatMgDate(d, lang)} ${l.at} ${formatMgTime(d, lang)} (${l.mg}, ${MADAGASCAR_UTC_OFFSET}) · ${formatGmtTime(d, lang)} GMT`
}
