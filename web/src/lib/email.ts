import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'ANABO Roadtrip <contact@anabo.mg>'
const ADMIN_EMAIL = process.env.CONTACT_EMAIL || 'contact@anabo.mg'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://roadtrip.anabo.mg'

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
  return `
    <h2>Nouvelle demande de devis — ${escapeHtml(data.reference)}</h2>
    <p><strong>Langue :</strong> ${escapeHtml(data.locale.toUpperCase())}</p>
    <p><strong>Client :</strong> ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</p>
    <p><strong>E-mail :</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
    <p><strong>Téléphone :</strong> ${escapeHtml(data.phone)}</p>
    <p><strong>Pays :</strong> ${escapeHtml(data.country) || '—'}</p>
    <hr />
    <p><strong>Itinéraire :</strong> ${escapeHtml(data.circuitTitle) || escapeHtml(data.circuitSlug) || '—'}</p>
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
      ${d.circuitTitle ? `<p><strong>Itinéraire :</strong> ${escapeHtml(d.circuitTitle)}</p>` : ''}
      <p>Notre équipe vous répondra sous 24 à 48 heures ouvrées.</p>
      <p>À très bientôt,<br />L'équipe ANABO Roadtrip Madagascar</p>
    `,
    en: (d) => `
      <p>Hello ${escapeHtml(d.firstName)},</p>
      <p>We have received your quote request and thank you for your trust.</p>
      <p><strong>Reference:</strong> ${escapeHtml(d.reference)}</p>
      ${d.circuitTitle ? `<p><strong>Itinerary:</strong> ${escapeHtml(d.circuitTitle)}</p>` : ''}
      <p>Our team will reply within 24 to 48 business hours.</p>
      <p>See you soon,<br />The ANABO Roadtrip Madagascar team</p>
    `,
    it: (d) => `
      <p>Ciao ${escapeHtml(d.firstName)},</p>
      <p>Abbiamo ricevuto la tua richiesta di preventivo e ti ringraziamo per la fiducia.</p>
      <p><strong>Riferimento:</strong> ${escapeHtml(d.reference)}</p>
      ${d.circuitTitle ? `<p><strong>Itinerario:</strong> ${escapeHtml(d.circuitTitle)}</p>` : ''}
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
    const clientEmail = buildClientEmail(data)
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
    confirmSubject: (r) => `Il tuo viaggio in Madagascar è confermato! (Rif: ${r})`,
    confirmBody1: 'Siamo felici di confermare la tua prenotazione per il viaggio in Madagascar.',
    confirmBody2: 'Non vediamo l’ora di accoglierti e di farti scoprire la nostra bellissima isola.',
    hello: 'Ciao',
    bye: 'A presto,',
    team: 'Il team ANABO Roadtrip',
  },
}

export async function sendQuoteStatusEmail(
  to: string,
  firstName: string,
  status: string,
  reference: string,
  token?: string,
  locale: string = 'fr',
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
      <p>${t.bye}<br/>${t.team}</p>
    `
  } else if (status === 'CONFIRME') {
    subject = t.confirmSubject(reference)
    html = `
      <p>${t.hello} ${escapeHtml(firstName)},</p>
      <p>${t.confirmBody1}</p>
      <p>${t.confirmBody2}</p>
      <p>${t.bye}<br/>${t.team}</p>
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