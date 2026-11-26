import { Resend } from 'resend'
import type { QuoteEstimateSnapshot } from '@/lib/pricing'
import type { VehicleEstimateSnapshot } from '@/lib/trip-pricing'
import { signQuoteToken } from '@/lib/quote-token'
import { depositAmount, formatAmount, getPaymentSettings, type PaymentSettingsData } from '@/lib/payment-settings'
import { formatTimestamp, formatTripDate } from '@/lib/datetime'
import { OFFICIAL_CONTACT, phoneDigits } from '@/lib/contact'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'ANABO Roadtrip <contact@anabo.mg>'
const ADMIN_EMAIL = process.env.CONTACT_EMAIL || 'contact@anabo.mg'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://roadtrip.anabo.mg'

type QuoteData = {
  id: string
  reference: string
  locale: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country?: string | null
  circuitSlug?: string | null
  circuitTitle?: string | null
  startDate?: Date | null
  endDate?: Date | null
  adults: number
  children: number
  message?: string | null
  estimateDetails?: QuoteEstimateSnapshot | null
  vehicleEstimate?: VehicleEstimateSnapshot | null
  vehicleCode?: string | null
  vehicleLabel?: string | null
  pricingMode?: string | null
  pricingPackageName?: string | null
  vehicleCount?: number
  consecutiveCircuits?: number
  /** Date d'enregistrement de la demande (UTC en base). */
  createdAt?: Date | null
}

// Texte de la politique tarifaire à rappeler sur chaque devis.
const FUEL_NOTICE: Record<'fr' | 'en' | 'it', string> = {
  fr: 'Les tarifs comprennent la location du véhicule et l’indemnité chauffeur. Le carburant reste à la charge du client pendant toute la durée du voyage, y compris les éventuels jours de retour à vide du véhicule vers Antananarivo.',
  en: 'Rates include vehicle rental and the driver allowance. Fuel is paid by the client throughout the trip, including any empty-return days of the vehicle to Antananarivo.',
  it: 'Le tariffe comprendono il noleggio del veicolo e l’indennità dell’autista. Il carburante è a carico del cliente per tutta la durata del viaggio, compresi gli eventuali giorni di rientro a vuoto del veicolo ad Antananarivo.',
}

// Coordonnées officielles en pied de chaque e-mail client (l'expéditeur Resend reste contact@anabo.mg).
function contactFooterHtml(lang: 'fr' | 'en' | 'it') {
  const c = OFFICIAL_CONTACT
  const L = {
    fr: { driver: `${c.driverGuideName}, votre chauffeur-guide`, phone: 'Téléphone direct' },
    en: { driver: `${c.driverGuideName}, your driver-guide`, phone: 'Direct phone' },
    it: { driver: `${c.driverGuideName}, il vostro autista-guida`, phone: 'Telefono diretto' },
  }[lang]
  const sep = lang === 'fr' ? ' : ' : ': '
  return `
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 12px;" />
      <p style="font-size: 12px; color: #6b7280; line-height: 1.6; margin: 0;">
        <strong>${c.companyName}</strong> · <a href="mailto:${c.companyEmail}" style="color: #6b7280;">${c.companyEmail}</a><br />
        ${L.driver} · ${L.phone}${sep}<a href="tel:+${phoneDigits(c.driverGuidePhone)}" style="color: #6b7280;">${c.driverGuidePhone}</a>
        · WhatsApp${sep}<a href="https://wa.me/${phoneDigits(c.whatsapp)}" style="color: #6b7280;">${c.whatsapp}</a>
        · <a href="mailto:${c.driverGuideEmail}" style="color: #6b7280;">${c.driverGuideEmail}</a>
      </p>`
}

function fuelHtml(lang: 'fr' | 'en' | 'it') {
  return `<p style="font-size: 13px; color: #78350f; background: #fef3c7; padding: 12px; border-radius: 6px;">⛽ ${FUEL_NOTICE[lang]}</p>`
}

const RECEIVED_LABEL: Record<'fr' | 'en' | 'it', string> = {
  fr: 'Demande reçue le',
  en: 'Request received on',
  it: 'Richiesta ricevuta il',
}

function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Dates de voyage : formatées en UTC pour ne jamais décaler d'un jour.
function formatDate(date?: Date | null): string {
  return formatTripDate(date, 'fr')
}

function formatMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${value.toLocaleString('fr-FR')} ${escapeHtml(currency)}`
  }
}

// Resend ne lève pas d'exception : il renvoie { data, error }
async function sendMail(payload: {
  from: string
  to: string
  subject: string
  html: string
  replyTo?: string
}) {
  const { error } = await resend.emails.send(payload)
  if (error) throw new Error(`Resend: ${error.message}`)
}

function buildAdminEmail(data: QuoteData) {
  const estimate = data.estimateDetails
  const vehicleEstimate = data.vehicleEstimate

  const vehicleCost = vehicleEstimate
    ? typeof vehicleEstimate.vehicleCost === 'number'
      ? vehicleEstimate.vehicleCost
      : vehicleEstimate.pricePerDay * vehicleEstimate.days * vehicleEstimate.vehicleCount
    : 0

  const driverRatePerDay = vehicleEstimate
    ? typeof vehicleEstimate.driverRatePerDay === 'number'
      ? vehicleEstimate.driverRatePerDay
      : 30
    : 30

  const driverCost = vehicleEstimate
    ? typeof vehicleEstimate.driverCost === 'number'
      ? vehicleEstimate.driverCost
      : vehicleEstimate.days * driverRatePerDay * vehicleEstimate.vehicleCount
    : 0

  const emptyReturnDays = vehicleEstimate?.emptyReturn?.returnDays ?? 0
  const emptyReturnDestination = vehicleEstimate?.emptyReturn?.destinationLabel ?? null
  const emptyReturnVehicleCost = vehicleEstimate
    ? typeof vehicleEstimate.emptyReturn?.vehicleCost === 'number'
      ? vehicleEstimate.emptyReturn.vehicleCost
      : emptyReturnDays * vehicleEstimate.pricePerDay * vehicleEstimate.vehicleCount
    : 0
  const emptyReturnDriverCost = vehicleEstimate
    ? typeof vehicleEstimate.emptyReturn?.driverCost === 'number'
      ? vehicleEstimate.emptyReturn.driverCost
      : emptyReturnDays * driverRatePerDay * vehicleEstimate.vehicleCount
    : 0
  const emptyReturnTotal = vehicleEstimate
    ? typeof vehicleEstimate.emptyReturn?.total === 'number'
      ? vehicleEstimate.emptyReturn.total
      : emptyReturnVehicleCost + emptyReturnDriverCost
    : 0

  const estimateSection = vehicleEstimate ? `
    <hr />
    <h3>Estimation indicative (véhicule, chauffeur &amp; retour à vide)</h3>
    <p><strong>Total estimé :</strong> ${formatMoney(vehicleEstimate.total, vehicleEstimate.currency)}</p>
    <ul>
      <li>Véhicule : ${escapeHtml(vehicleEstimate.vehicleName)} [${escapeHtml(vehicleEstimate.vehicleCode)}], capacité ${vehicleEstimate.capacity} pers., ${vehicleEstimate.vehicleCount} véhicule(s)</li>
      <li>Location véhicule (${vehicleEstimate.days} j) : <strong>${formatMoney(vehicleCost, vehicleEstimate.currency)}</strong> (${formatMoney(vehicleEstimate.pricePerDay, vehicleEstimate.currency)} / j × ${vehicleEstimate.days} j × ${vehicleEstimate.vehicleCount} véhicule(s))</li>
      <li>Indemnité chauffeur (${vehicleEstimate.days} j) : <strong>${formatMoney(driverCost, vehicleEstimate.currency)}</strong> (${formatMoney(driverRatePerDay, vehicleEstimate.currency)} / j × ${vehicleEstimate.days} j × ${vehicleEstimate.vehicleCount} véhicule(s))</li>
      <li>Retour à vide Antananarivo${emptyReturnDestination ? ` (${escapeHtml(emptyReturnDestination)})` : ''} — ${emptyReturnDays} j : <strong>${formatMoney(emptyReturnTotal, vehicleEstimate.currency)}</strong>${emptyReturnDays > 0 ? ` [Véhicule : ${formatMoney(emptyReturnVehicleCost, vehicleEstimate.currency)} · Chauffeur : ${formatMoney(emptyReturnDriverCost, vehicleEstimate.currency)}]` : ''}</li>
      ${vehicleEstimate.indicativeOnly ? '<li>Tarif indicatif : confirmer disponibilité et saison.</li>' : ''}
      <li>Carburant non inclus : à la charge du client (circuit, transferts et retour à vide).</li>
      ${vehicleEstimate.emptyReturn?.vehicleFerryNotIncluded ? '<li><strong>Véhicule embarqué vers Nosy Be</strong> : frais de bac du véhicule (Ankify ↔ Nosy Be) à ajouter au devis.</li>' : ''}
    </ul>
  ` : estimate ? `
    <hr />
    <h3>Estimation indicative recalculée</h3>
    <p><strong>Total estimé :</strong> ${formatMoney(estimate.finalPrice, estimate.currency)}</p>
    <ul>
      <li>Voyageurs : ${estimate.adults} adulte(s), ${estimate.children} enfant(s), ${estimate.people} au total</li>
      <li>Durée prise en compte : ${estimate.days} jour(s)</li>
      <li>${estimate.pricingMode === 'TOUR_INCLUDED' ? 'Prix global du circuit, véhicule inclus' : 'Base historique'} : ${formatMoney(estimate.baseTotal, estimate.currency)}${estimate.pricingMode === 'TOUR_INCLUDED' ? '' : ` (${formatMoney(estimate.basePricePerPerson, estimate.currency)} par personne)`}</li>
      ${estimate.vehicle ? `<li>Véhicule : ${escapeHtml(estimate.vehicle.label)} [clé ${escapeHtml(estimate.vehicle.code)}, option ${escapeHtml(estimate.vehicle.matchedOptionCode)}], capacité ${estimate.vehicle.capacity}, ${estimate.vehicle.vehiclesCharged} véhicule(s) facturé(s), location ${formatMoney(estimate.vehicle.total, estimate.currency)}</li>` : ''}
      ${estimate.package ? `<li>Package ${escapeHtml(estimate.package.name)} : ${estimate.package.items.map((item) => `${escapeHtml(item.name)} (${formatMoney(item.unitPrice, estimate.currency)} × ${item.quantity} = ${formatMoney(item.total, estimate.currency)})`).join(', ')} — total ${formatMoney(estimate.package.total, estimate.currency)}</li>` : ''}
      ${estimate.discounts.multiplex.percentage ? `<li>Réduction Multiplex : -${estimate.discounts.multiplex.percentage}% (−${formatMoney(estimate.discounts.multiplex.amount, estimate.currency)}) sur ${estimate.consecutiveCircuits} circuit(s) consécutif(s)</li>` : ''}
      ${estimate.discounts.fleet.percentage ? `<li>Réduction flotte : -${estimate.discounts.fleet.percentage}% (−${formatMoney(estimate.discounts.fleet.amount, estimate.currency)}) pour ${estimate.vehicleCount} véhicule(s)</li>` : ''}
      ${estimate.vehicle?.indicativeOnly ? '<li>Le tarif de location est indicatif : confirmer disponibilité et saison.</li>' : ''}
    </ul>
  ` : data.circuitSlug === 'sur-mesure' ? `
    <hr /><h3>Estimation indicative</h3>
    <p>Aucun tarif complet n’a pu être calculé. Véhicule sélectionné : ${data.vehicleCode ? `${escapeHtml(data.vehicleLabel)} [${escapeHtml(data.vehicleCode)}]` : 'aucun'}, ${data.vehicleCount || 1} véhicule(s), ${data.consecutiveCircuits || 1} circuit(s) consécutif(s). Vérifiez que le circuit et les clés techniques des véhicules disposent de tarifs configurés.</p>
  ` : ''
  return `
    <h2>Nouvelle demande de devis — ${escapeHtml(data.reference)}</h2>
    <p><strong>Langue :</strong> ${escapeHtml(data.locale.toUpperCase())}</p>
    ${data.createdAt ? `<p><strong>Reçue le :</strong> ${escapeHtml(formatTimestamp(data.createdAt, 'fr'))}</p>` : ''}
    <p><strong>Client :</strong> ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</p>
    <p><strong>E-mail :</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
    <p><strong>Téléphone :</strong> ${escapeHtml(data.phone)}</p>
    <p><strong>Pays :</strong> ${escapeHtml(data.country) || '—'}</p>
    <hr />
    <p><strong>Itinéraire :</strong> ${escapeHtml(data.circuitTitle) || escapeHtml(data.circuitSlug) || '—'}</p>
    <p><strong>Dates :</strong> ${formatDate(data.startDate)} → ${formatDate(data.endDate)}</p>
    <p><strong>Voyageurs :</strong> ${data.adults} adulte(s), ${data.children} enfant(s)</p>
    ${data.pricingMode ? `<p><strong>Mode tarifaire demandé :</strong> ${data.pricingMode === 'DAILY_CAR' ? 'Daily price car' : 'Tour price (included vehicle)'}</p>` : ''}
    ${data.pricingPackageName ? `<p><strong>Package demandé :</strong> ${escapeHtml(data.pricingPackageName)}</p>` : ''}
    <hr />
    <p><strong>Message :</strong></p>
    <p>${data.message ? escapeHtml(data.message).replace(/\n/g, '<br />') : '—'}</p>
    ${estimateSection}
    <hr />
    <p><a href="${SITE_URL}/admin/demandes/${encodeURIComponent(data.id)}">Ouvrir la fiche administrative</a></p>
    <p style="color:#888;font-size:12px;">Référence : ${escapeHtml(data.reference)}</p>
  `
}

function clientQuoteUrl(d: QuoteData, lang: string) {
  return `${SITE_URL}/${lang}/devis/${encodeURIComponent(d.reference)}?token=${encodeURIComponent(signQuoteToken(d.id))}`
}

function buildClientEmail(data: QuoteData, depositPercent = 0) {
  const subjects: Record<string, string> = {
    fr: 'Votre demande de devis a bien été reçue',
    en: 'Your quote request has been received',
    it: 'La tua richiesta di preventivo è stata ricevuta',
  }

  const bodies: Record<string, (d: QuoteData) => string> = {
    fr: (d) => `
      <p>Bonjour ${escapeHtml(d.firstName)},</p>
      <p>Nous avons bien reçu votre demande de devis et vous remercions de votre confiance.</p>
      <p><strong>Référence :</strong> ${escapeHtml(d.reference)}</p>
      ${d.createdAt ? `<p style="font-size: 13px; color: #475569;">${RECEIVED_LABEL.fr} ${escapeHtml(formatTimestamp(d.createdAt, 'fr'))}</p>` : ''}
      <p><a href="${clientQuoteUrl(d, 'fr')}">Suivre votre demande</a> · <a href="${SITE_URL}/fr/annulation">Conditions d’annulation et de remboursement</a></p>
      ${d.circuitTitle ? `<p><strong>Itinéraire :</strong> ${escapeHtml(d.circuitTitle)}</p>` : ''}
      <p>Notre équipe vous répondra sous 24 à 48 heures ouvrées.</p>
      ${depositPercent > 0 ? `<p>Bon à savoir : la réservation se confirme avec un acompte de ${depositPercent} % du montant du devis.</p>` : ''}
      ${fuelHtml('fr')}
      <p>À très bientôt,<br />L'équipe ANABO Roadtrip Madagascar</p>
      ${contactFooterHtml('fr')}
    `,
    en: (d) => `
      <p>Hello ${escapeHtml(d.firstName)},</p>
      <p>We have received your quote request and thank you for your trust.</p>
      <p><strong>Reference:</strong> ${escapeHtml(d.reference)}</p>
      ${d.createdAt ? `<p style="font-size: 13px; color: #475569;">${RECEIVED_LABEL.en} ${escapeHtml(formatTimestamp(d.createdAt, 'en'))}</p>` : ''}
      <p><a href="${clientQuoteUrl(d, 'en')}">Track your request</a> · <a href="${SITE_URL}/en/annulation">Cancellation and refund policy</a></p>
      ${d.circuitTitle ? `<p><strong>Itinerary:</strong> ${escapeHtml(d.circuitTitle)}</p>` : ''}
      <p>Our team will reply within 24 to 48 business hours.</p>
      ${depositPercent > 0 ? `<p>Good to know: your booking is confirmed with a deposit of ${depositPercent}% of the quote amount.</p>` : ''}
      ${fuelHtml('en')}
      <p>See you soon,<br />The ANABO Roadtrip Madagascar team</p>
      ${contactFooterHtml('en')}
    `,
    it: (d) => `
      <p>Ciao ${escapeHtml(d.firstName)},</p>
      <p>Abbiamo ricevuto la tua richiesta di preventivo e ti ringraziamo per la fiducia.</p>
      <p><strong>Riferimento:</strong> ${escapeHtml(d.reference)}</p>
      ${d.createdAt ? `<p style="font-size: 13px; color: #475569;">${RECEIVED_LABEL.it} ${escapeHtml(formatTimestamp(d.createdAt, 'it'))}</p>` : ''}
      <p><a href="${clientQuoteUrl(d, 'it')}">Segui la tua richiesta</a> · <a href="${SITE_URL}/it/annulation">Condizioni di cancellazione e rimborso</a></p>
      ${d.circuitTitle ? `<p><strong>Itinerario:</strong> ${escapeHtml(d.circuitTitle)}</p>` : ''}
      <p>Il nostro team risponderà entro 24-48 ore lavorative.</p>
      ${depositPercent > 0 ? `<p>Da sapere: la prenotazione si conferma con un acconto del ${depositPercent}% dell’importo del preventivo.</p>` : ''}
      ${fuelHtml('it')}
      <p>A presto,<br />Il team ANABO Roadtrip Madagascar</p>
      ${contactFooterHtml('it')}
    `,
  }

  return {
    subject: subjects[data.locale] || subjects.fr,
    html: (bodies[data.locale] || bodies.fr)(data),
  }
}

export async function sendQuoteEmails(data: QuoteData) {
  const errors: string[] = []

  try {
    await sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: `[ANABO] Nouvelle demande de devis — ${data.reference}`,
      html: buildAdminEmail(data),
    })
  } catch (err) {
    errors.push(`admin: ${err instanceof Error ? err.message : String(err)}`)
  }

  try {
    const clientEmail = buildClientEmail(data, (await getPaymentSettings()).depositPercent)
    await sendMail({
      from: FROM_EMAIL,
      to: data.email,
      replyTo: ADMIN_EMAIL,
      subject: clientEmail.subject,
      html: clientEmail.html,
    })
  } catch (err) {
    errors.push(`client: ${err instanceof Error ? err.message : String(err)}`)
  }

  if (errors.length > 0) console.error('[email] Erreurs:', errors)
  return { ok: errors.length === 0, errors }
}

type StatusLocale = 'fr' | 'en' | 'it'

const STATUS_TEXTS: Record<
  StatusLocale,
  {
    quoteSubject: (ref: string) => string
    quoteIntro: string
    quoteButton: string
    quoteOutro: string
    cancellationNote: string
    confirmSubject: (ref: string) => string
    confirmBody1: string
    confirmBody2: string
    hello: string
    bye: string
    team: string
  }
> = {
  fr: {
    quoteSubject: (r) => `Votre devis ANABO Roadtrip est prêt (Réf: ${r})`,
    quoteIntro:
      'Nous avons le plaisir de vous informer que votre devis personnalisé pour votre voyage à Madagascar est prêt.',
    quoteButton: 'Consulter mon devis',
    quoteOutro: 'Vous pourrez le consulter et le confirmer directement depuis ce lien.',
    cancellationNote: 'Important : le délai d’annulation se calcule entre la date de votre confirmation et la date de départ. Un devis accepté à moins de 15 jours calendaires du départ ne peut pas être annulé dans le cadre de la procédure habituelle. En cas de départ anticipé, les jours non utilisés ne sont pas remboursés.',
    confirmSubject: (r) => `Votre voyage à Madagascar est confirmé ! (Réf: ${r})`,
    confirmBody1: 'Nous sommes ravis de confirmer votre réservation pour votre voyage à Madagascar.',
    confirmBody2: 'Nous avons hâte de vous accueillir et de vous faire découvrir notre belle île.',
    hello: 'Bonjour',
    bye: 'À très bientôt,',
    team: "L'équipe ANABO Roadtrip",
  },
  en: {
    quoteSubject: (r) => `Your ANABO Roadtrip quote is ready (Ref: ${r})`,
    quoteIntro:
      'We are pleased to let you know that your personalised quote for your trip to Madagascar is ready.',
    quoteButton: 'View my quote',
    quoteOutro: 'You can review and confirm it directly from this link.',
    cancellationNote: 'Important: the cancellation period runs from the date you confirm to the departure date. A quote accepted less than 15 calendar days before departure cannot be cancelled under the usual procedure. If you leave the trip early, unused days are not refunded.',
    confirmSubject: (r) => `Your trip to Madagascar is confirmed! (Ref: ${r})`,
    confirmBody1: 'We are delighted to confirm your booking for your trip to Madagascar.',
    confirmBody2: 'We look forward to welcoming you and showing you our beautiful island.',
    hello: 'Hello',
    bye: 'See you soon,',
    team: 'The ANABO Roadtrip team',
  },
  it: {
    quoteSubject: (r) => `Il tuo preventivo ANABO Roadtrip è pronto (Rif: ${r})`,
    quoteIntro:
      'Siamo lieti di informarti che il tuo preventivo personalizzato per il viaggio in Madagascar è pronto.',
    quoteButton: 'Consulta il preventivo',
    quoteOutro: 'Potrai consultarlo e confermarlo direttamente da questo link.',
    cancellationNote: 'Importante: il termine di annullamento si calcola tra la data della conferma e la data di partenza. Un preventivo accettato a meno di 15 giorni di calendario dalla partenza non può essere annullato secondo la procedura abituale. In caso di partenza anticipata, i giorni non utilizzati non vengono rimborsati.',
    confirmSubject: (r) => `Il tuo viaggio in Madagascar è confermato! (Rif: ${r})`,
    confirmBody1: 'Siamo felici di confermare la tua prenotazione per il viaggio in Madagascar.',
    confirmBody2: 'Non vediamo l’ora di accoglierti e di farti scoprire la nostra bellissima isola.',
    hello: 'Ciao',
    bye: 'A presto,',
    team: 'Il team ANABO Roadtrip',
  },
}

type DepositInfo = {
  settings: PaymentSettingsData
  total?: number | null
  currency?: string | null
}

const DEPOSIT_TEXTS = {
  fr: {
    required: (p: number, amount: string | null) => `Un acompte de ${p} % du montant total du devis${amount ? `, soit <strong>${amount}</strong>,` : ''} est requis pour confirmer votre réservation.`,
    how: (method: string, phone: string, holder: string | null) => `Paiement par <strong>${method}</strong> au <strong>${phone}</strong>${holder ? ` (titulaire : <strong>${holder}</strong>)` : ''}.`,
    ref: (r: string) => `Merci d’indiquer la référence <strong>${r}</strong> comme motif du paiement.`,
    confirmed: 'Votre réservation devient définitive à réception de l’acompte.',
  },
  en: {
    required: (p: number, amount: string | null) => `A deposit of ${p}% of the total quote${amount ? `, i.e. <strong>${amount}</strong>,` : ''} is required to confirm your booking.`,
    how: (method: string, phone: string, holder: string | null) => `Payment by <strong>${method}</strong> to <strong>${phone}</strong>${holder ? ` (account holder: <strong>${holder}</strong>)` : ''}.`,
    ref: (r: string) => `Please use the reference <strong>${r}</strong> as the payment description.`,
    confirmed: 'Your booking becomes final once the deposit has been received.',
  },
  it: {
    required: (p: number, amount: string | null) => `Per confermare la prenotazione è richiesto un acconto del ${p}% dell’importo totale del preventivo${amount ? `, pari a <strong>${amount}</strong>` : ''}.`,
    how: (method: string, phone: string, holder: string | null) => `Pagamento tramite <strong>${method}</strong> al numero <strong>${phone}</strong>${holder ? ` (intestatario: <strong>${holder}</strong>)` : ''}.`,
    ref: (r: string) => `Indicate il riferimento <strong>${r}</strong> come causale del pagamento.`,
    confirmed: 'La prenotazione diventa definitiva al ricevimento dell’acconto.',
  },
}

function depositHtml(lang: 'fr' | 'en' | 'it', reference: string, deposit?: DepositInfo, confirmed = false) {
  if (!deposit || deposit.settings.depositPercent <= 0) return ''
  const t = DEPOSIT_TEXTS[lang]
  const s = deposit.settings
  const amount = depositAmount(deposit.total, s.depositPercent)
  const intl = lang === 'en' ? 'en-GB' : lang === 'it' ? 'it-IT' : 'fr-FR'
  const amountText = amount ? formatAmount(amount, deposit.currency, intl) : null
  return `
      <div style="margin: 20px 0; padding: 14px 16px; border-radius: 8px; background: #eff6ff; color: #0c2d6b; font-size: 14px; line-height: 1.6;">
        <p style="margin: 0 0 6px;">${t.required(s.depositPercent, amountText)}</p>
        <p style="margin: 0 0 6px;">${t.how(escapeHtml(s.method), escapeHtml(s.phoneNumber), s.accountHolder ? escapeHtml(s.accountHolder) : null)}</p>
        <p style="margin: 0;">${t.ref(escapeHtml(reference))}${s.instructions ? `<br/>${escapeHtml(s.instructions)}` : ''}</p>
        ${confirmed ? `<p style="margin: 6px 0 0;"><strong>${t.confirmed}</strong></p>` : ''}
      </div>`
}

export async function sendQuoteStatusEmail(
  to: string,
  firstName: string,
  status: string,
  reference: string,
  token?: string,
  locale: string = 'fr',
  deposit?: DepositInfo,
) {
  const lang: StatusLocale = locale === 'en' || locale === 'it' ? locale : 'fr'
  const t = STATUS_TEXTS[lang]

  let subject = ''
  let html = ''

  if (status === 'DEVIS_ENVOYE') {
    if (!token) throw new Error('Jeton manquant pour le lien du devis')
    const quoteUrl = `${SITE_URL}/${lang}/devis/${encodeURIComponent(reference)}?token=${encodeURIComponent(token)}`
    subject = t.quoteSubject(reference)
    html = `
      <p>${t.hello} ${escapeHtml(firstName)},</p>
      <p>${t.quoteIntro}</p>
      <p style="margin: 30px 0;">
        <a href="${quoteUrl}" style="background-color: #E0A01C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          ${t.quoteButton}
        </a>
      </p>
      <p>${t.quoteOutro}</p>
      ${depositHtml(lang, reference, deposit)}
      ${fuelHtml(lang)}
      <p style="font-size: 13px; color: #92400e; background: #fffbeb; padding: 12px; border-radius: 6px;">${t.cancellationNote}</p>
      <p>${t.bye}<br/>${t.team}</p>
      ${contactFooterHtml(lang)}
    `
  } else if (status === 'CONFIRME') {
    subject = t.confirmSubject(reference)
    html = `
      <p>${t.hello} ${escapeHtml(firstName)},</p>
      <p>${t.confirmBody1}</p>
      ${deposit?.settings && !deposit.settings.depositPercent ? '' : depositHtml(lang, reference, deposit, true)}
      <p>${t.confirmBody2}</p>
      <p>${t.bye}<br/>${t.team}</p>
      ${contactFooterHtml(lang)}
    `
  }

  if (!subject) return

  await sendMail({ from: FROM_EMAIL, to, subject, html })
}

export async function sendNewUserEmail(
  to: string,
  name: string,
  password: string,
  role: string,
) {
  const subject = `Vos accès à l'administration ANABO Roadtrip`
  const html = `
    <p>Bonjour ${escapeHtml(name)},</p>
    <p>Un compte administrateur vient d'être créé pour vous sur le site ANABO Roadtrip.</p>
    <p>Voici vos identifiants de connexion :</p>
    <ul>
      <li><strong>Email :</strong> ${escapeHtml(to)}</li>
      <li><strong>Mot de passe temporaire :</strong> <code>${escapeHtml(password)}</code></li>
      <li><strong>Rôle :</strong> ${escapeHtml(role)}</li>
    </ul>
    <p>Pour des raisons de sécurité, nous vous recommandons de changer ce mot de passe dès votre première connexion.</p>
    <p style="margin: 30px 0;">
      <a href="${SITE_URL}/admin/login" style="background-color: #06245F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        Se connecter à l'administration
      </a>
    </p>
    <p>À très bientôt,<br/>L'équipe ANABO Roadtrip</p>
  `

  await sendMail({ from: FROM_EMAIL, to, subject, html })
}

const DEPOSIT_RECEIVED = {
  fr: { subject: (r: string) => `Acompte reçu — votre voyage est réservé (Réf : ${r})`, hello: 'Bonjour', body: 'Nous avons bien reçu votre acompte. Votre réservation est désormais définitive.', next: 'Nous reviendrons vers vous pour les derniers détails avant le départ.', bye: 'À très bientôt,', team: "L'équipe ANABO Roadtrip Madagascar" },
  en: { subject: (r: string) => `Deposit received — your trip is booked (Ref: ${r})`, hello: 'Hello', body: 'We have received your deposit. Your booking is now final.', next: 'We will be in touch with the final details before your departure.', bye: 'See you soon,', team: 'The ANABO Roadtrip Madagascar team' },
  it: { subject: (r: string) => `Acconto ricevuto — il tuo viaggio è prenotato (Rif: ${r})`, hello: 'Ciao', body: 'Abbiamo ricevuto il tuo acconto. La prenotazione è ora definitiva.', next: 'Ti ricontatteremo per gli ultimi dettagli prima della partenza.', bye: 'A presto,', team: 'Il team ANABO Roadtrip Madagascar' },
}

/** E-mail au client lorsque l'administrateur marque l'acompte comme reçu. */
export async function sendDepositReceivedEmail(to: string, firstName: string, reference: string, locale: string = 'fr') {
  const lang = locale === 'en' || locale === 'it' ? locale : 'fr'
  const t = DEPOSIT_RECEIVED[lang]
  await sendMail({
    from: FROM_EMAIL,
    to,
    subject: t.subject(reference),
    html: `
      <p>${t.hello} ${escapeHtml(firstName)},</p>
      <p>${t.body}</p>
      <p>${t.next}</p>
      <p>${t.bye}<br/>${t.team}</p>
      ${contactFooterHtml(lang)}
    `,
  })
}

/** E-mail à l'équipe : le client a accepté son devis en ligne (acompte attendu). */
export async function sendClientAcceptedAdminEmail(data: {
  id: string
  reference: string
  firstName: string
  lastName: string
  email: string
  phone: string
  acceptedAt: Date
  depositPercent: number
  depositText: string | null
}) {
  await sendMail({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `[ANABO] Devis accepté en ligne — ${data.reference}`,
    html: `
      <h2>Devis accepté par le client — ${escapeHtml(data.reference)}</h2>
      <p><strong>${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</strong> a confirmé son devis le
      ${escapeHtml(formatTimestamp(data.acceptedAt, 'fr'))}.</p>
      <p>Acompte attendu : ${data.depositPercent} %${data.depositText ? ` — <strong>${escapeHtml(data.depositText)}</strong>` : ' (montant total du devis non renseigné dans l’admin)'}.</p>
      <p>Contact : ${escapeHtml(data.email)} · ${escapeHtml(data.phone)}</p>
      <p><a href="${SITE_URL}/admin/demandes/${encodeURIComponent(data.id)}">Ouvrir la fiche et suivre l’acompte</a></p>
    `,
  })
}