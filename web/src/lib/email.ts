import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// 1. CORRECTION : On utilise votre domaine vérifié au lieu de onboarding@resend.dev
const FROM_EMAIL = 'ANABO Roadtrip <contact@anabo.mg>'

// 2. CORRECTION : On met votre vraie adresse de réception par défaut
const ADMIN_EMAIL = process.env.CONTACT_EMAIL || 'contact@anabo.mg'

type QuoteData = {
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
}

// Fonction de sécurité pour échapper les caractères HTML
function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDate(date?: Date | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function buildAdminEmail(data: QuoteData) {
  return `
    <h2>Nouvelle demande de devis — ${escapeHtml(data.reference)}</h2>
    <p><strong>Langue :</strong> ${escapeHtml(data.locale.toUpperCase())}</p>
    <p><strong>Client :</strong> ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</p>
    <p><strong>E-mail :</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
    <p><strong>Téléphone :</strong> ${escapeHtml(data.phone)}</p>
    <p><strong>Pays :</strong> ${escapeHtml(data.country) || '—'}</p>
    <hr />
    <p><strong>Circuit :</strong> ${escapeHtml(data.circuitTitle) || escapeHtml(data.circuitSlug) || '—'}</p>
    <p><strong>Dates :</strong> ${formatDate(data.startDate)} → ${formatDate(data.endDate)}</p>
    <p><strong>Voyageurs :</strong> ${data.adults} adulte(s), ${data.children} enfant(s)</p>
    <hr />
    <p><strong>Message :</strong></p>
    <p>${data.message ? escapeHtml(data.message).replace(/\n/g, '<br />') : '—'}</p>
    <hr />
    <p style="color:#888;font-size:12px;">Référence : ${escapeHtml(data.reference)}</p>
  `
}

function buildClientEmail(data: QuoteData) {
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
      ${d.circuitTitle ? `<p><strong>Circuit :</strong> ${escapeHtml(d.circuitTitle)}</p>` : ''}
      <p>Notre équipe vous répondra sous 24 à 48 heures ouvrées.</p>
      <p>À très bientôt,<br />L'équipe ANABO Roadtrip Madagascar</p>
    `,
    en: (d) => `
      <p>Hello ${escapeHtml(d.firstName)},</p>
      <p>We have received your quote request and thank you for your trust.</p>
      <p><strong>Reference:</strong> ${escapeHtml(d.reference)}</p>
      ${d.circuitTitle ? `<p><strong>Tour:</strong> ${escapeHtml(d.circuitTitle)}</p>` : ''}
      <p>Our team will reply within 24 to 48 business hours.</p>
      <p>See you soon,<br />The ANABO Roadtrip Madagascar team</p>
    `,
    it: (d) => `
      <p>Ciao ${escapeHtml(d.firstName)},</p>
      <p>Abbiamo ricevuto la tua richiesta di preventivo e ti ringraziamo per la fiducia.</p>
      <p><strong>Riferimento:</strong> ${escapeHtml(d.reference)}</p>
      ${d.circuitTitle ? `<p><strong>Tour:</strong> ${escapeHtml(d.circuitTitle)}</p>` : ''}
      <p>Il nostro team risponderà entro 24-48 ore lavorative.</p>
      <p>A presto,<br />Il team ANABO Roadtrip Madagascar</p>
    `,
  }

  return {
    subject: subjects[data.locale] || subjects.fr,
    html: (bodies[data.locale] || bodies.fr)(data),
  }
}

export async function sendQuoteEmails(data: QuoteData) {
  const errors: string[] = []

  // 1. Notification admin (vers contact@anabo.mg)
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: data.email, // TRÈS UTILE : Si vous cliquez sur "Répondre", ça répondra directement au client !
      subject: `[ANABO] Nouvelle demande de devis — ${escapeHtml(data.reference)}`,
      html: buildAdminEmail(data),
    })
  } catch (err) {
    errors.push(`admin: ${err instanceof Error ? err.message : String(err)}`)
  }

  // 2. Accusé de réception au client
  try {
    const clientEmail = buildClientEmail(data)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      replyTo: ADMIN_EMAIL, // Si le client répond, ça vous arrive sur contact@anabo.mg
      subject: clientEmail.subject,
      html: clientEmail.html,
    })
  } catch (err) {
    errors.push(`client: ${err instanceof Error ? err.message : String(err)}`)
  }

  if (errors.length > 0) {
    console.error('[email] Erreurs:', errors)
  }

  return { ok: errors.length === 0, errors }
}