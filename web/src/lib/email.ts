import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Expéditeur : adresse de test Resend (obligatoire avant vérification du domaine)
const FROM_EMAIL = process.env.NODE_ENV === 'production' 
  ? 'ANABO Roadtrip <onboarding@resend.dev>'
  : 'ANABO Roadtrip <onboarding@resend.dev>'

// Destinataire des notifications internes
const ADMIN_EMAIL = process.env.CONTACT_EMAIL || 'mytrip.mada@gmail.com'

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
    <h2>Nouvelle demande de devis — ${data.reference}</h2>
    <p><strong>Langue :</strong> ${data.locale.toUpperCase()}</p>
    <p><strong>Client :</strong> ${data.firstName} ${data.lastName}</p>
    <p><strong>E-mail :</strong> <a href="mailto:${data.email}">${data.email}</a></p>
    <p><strong>Téléphone :</strong> ${data.phone}</p>
    <p><strong>Pays :</strong> ${data.country || '—'}</p>
    <hr />
    <p><strong>Circuit :</strong> ${data.circuitTitle || data.circuitSlug || '—'}</p>
    <p><strong>Dates :</strong> ${formatDate(data.startDate)} → ${formatDate(data.endDate)}</p>
    <p><strong>Voyageurs :</strong> ${data.adults} adulte(s), ${data.children} enfant(s)</p>
    <hr />
    <p><strong>Message :</strong></p>
    <p>${data.message ? data.message.replace(/\n/g, '<br />') : '—'}</p>
    <hr />
    <p style="color:#888;font-size:12px;">Référence : ${data.reference}</p>
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
      <p>Bonjour ${d.firstName},</p>
      <p>Nous avons bien reçu votre demande de devis et vous remercions de votre confiance.</p>
      <p><strong>Référence :</strong> ${d.reference}</p>
      ${d.circuitTitle ? `<p><strong>Circuit :</strong> ${d.circuitTitle}</p>` : ''}
      <p>Notre équipe vous répondra sous 24 à 48 heures ouvrées.</p>
      <p>À très bientôt,<br />L'équipe ANABO Roadtrip Madagascar</p>
    `,
    en: (d) => `
      <p>Hello ${d.firstName},</p>
      <p>We have received your quote request and thank you for your trust.</p>
      <p><strong>Reference:</strong> ${d.reference}</p>
      ${d.circuitTitle ? `<p><strong>Tour:</strong> ${d.circuitTitle}</p>` : ''}
      <p>Our team will reply within 24 to 48 business hours.</p>
      <p>See you soon,<br />The ANABO Roadtrip Madagascar team</p>
    `,
    it: (d) => `
      <p>Ciao ${d.firstName},</p>
      <p>Abbiamo ricevuto la tua richiesta di preventivo e ti ringraziamo per la fiducia.</p>
      <p><strong>Riferimento:</strong> ${d.reference}</p>
      ${d.circuitTitle ? `<p><strong>Tour:</strong> ${d.circuitTitle}</p>` : ''}
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

  // 1. Notification admin
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[ANABO] Nouvelle demande de devis — ${data.reference}`,
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