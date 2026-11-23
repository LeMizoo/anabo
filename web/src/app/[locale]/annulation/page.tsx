import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n'
import { pageAlternates } from '@/lib/seo'
import { getPaymentSettings } from '@/lib/payment-settings'

type Props = { params: Promise<{ locale: string }> }

type Content = {
  title: string
  description: string
  intro: string
  depositTitle: string
  deposit: (percent: number) => string
  depositHow: (method: string, phone: string, holder: string | null) => string
  depositFinal: string
  delaysTitle: string
  delays: [string, string][]
  noFlatFee: string
  earlyTitle: string
  early: string
  traceTitle: string
  trace: string[]
  howTitle: string
  how: (email: ReactNode) => ReactNode
  mailSubject: string
  refundTitle: string
  refund: string[]
  lawTitle: string
  law: string
  refs: string
  lawLink: string
  decreeLink: string
  footer: string
}

const LEX = 'https://textes.lexxika.com/lois-malagasy/loi-n2015-014-du-10-aout-2015-sur-les-garanties-et-la-protection-des-consommateurs/'
const DECREE = 'https://www.pic.commerce.mg/sites/default/files/2023-05/Madagascar-Decret-2001-27-normes-operateurs-touristiques_2.pdf'

const CONTENT: Record<Locale, Content> = {
  fr: {
    title: 'Annulation et remboursement',
    description: 'Conditions d’annulation et de remboursement des voyages ANABO Roadtrip Madagascar : délai de 15 jours, départ anticipé, procédure et remboursements.',
    intro: 'Des conditions communiquées avant votre réservation, adaptées aux prestations réellement réservées.',
    depositTitle: 'Acompte et paiement',
    deposit: (p) => `Un acompte de ${p} % du montant total du devis est requis pour confirmer la réservation.`,
    depositHow: (m, ph, h) => `Paiement par ${m} au ${ph}${h ? ` (titulaire : ${h})` : ''}, en indiquant la référence de votre devis comme motif.`,
    depositFinal: 'La réservation devient définitive à réception de l’acompte. Le solde est réglé selon les modalités indiquées dans le devis accepté.',
    delaysTitle: 'Délais d’annulation',
    delays: [
      ['Avant l’acceptation du devis :', 'votre demande de devis est sans frais et peut être retirée à tout moment.'],
      ['Calcul du délai :', 'le délai est calculé entre la date de confirmation et d’acceptation du devis par le client et la date de départ souhaitée.'],
      ['Acceptation au moins 15 jours calendaires avant le départ :', 'une annulation peut être demandée selon la procédure ci-dessous. Les sommes remboursables et les éventuels frais déjà engagés auprès de prestataires tiers sont précisés dans le devis accepté.'],
      ['Acceptation à moins de 15 jours calendaires avant le départ :', 'si le devis est accepté moins de 15 jours calendaires avant le départ souhaité, la réservation ne peut pas être annulée dans le cadre de la procédure habituelle. Cette information vous est rappelée avant toute confirmation.'],
    ],
    noFlatFee: 'Aucun frais forfaitaire d’annulation n’est ajouté sans avoir été annoncé et accepté.',
    earlyTitle: 'Départ anticipé',
    early: 'Si vous quittez le voyage avant la date de retour initialement convenue, aucun remboursement des jours non utilisés ne sera accordé.',
    traceTitle: 'Traçabilité de votre acceptation',
    trace: [
      'Lorsque vous confirmez votre devis depuis votre lien personnel et sécurisé, la date et l’heure exactes de votre acceptation sont enregistrées automatiquement. Elles servent de référence au calcul du délai de 15 jours et permettent de justifier ce calcul en cas de contestation.',
      'Les dates de voyage acceptées à ce moment-là sont également conservées, même si elles sont modifiées ensuite d’un commun accord.',
    ],
    howTitle: 'Comment demander une annulation',
    how: (email) => <>Écrivez à {email} en indiquant votre référence, le nom du voyageur principal et les prestations concernées. Nous vous accusons réception par e-mail et vous indiquons les prochaines étapes ainsi que le calcul des sommes éventuellement remboursables. Le lien de suivi personnel figure dans l’e-mail de confirmation de votre demande.</>,
    mailSubject: 'Demande d’annulation',
    refundTitle: 'Remboursement et circonstances exceptionnelles',
    refund: [
      'Lorsqu’un remboursement est dû, nous confirmons son montant et le moyen de remboursement par écrit. Il est effectué, dans la mesure du possible, par le moyen de paiement initial et dans les 30 jours suivant l’accord écrit sur son montant, sous réserve des délais des prestataires de paiement.',
      'En cas de force majeure ou d’événement empêchant le voyage, contactez-nous sans délai. Nous examinerons la situation, les prestations concernées et les règles applicables, puis proposerons les solutions et remboursements prévus par le contrat et la loi. Aucun avoir ne remplace un remboursement dû sans votre accord.',
    ],
    lawTitle: 'Information sur les textes applicables',
    law: 'La loi malgache n° 2015-014 prévoit notamment, à son article 30, un délai de quinze jours francs pour retourner un produit non conforme. Cette disposition ne constitue pas un délai général de rétractation applicable aux prestations touristiques. Les textes malgaches consultés ne permettent pas d’affirmer ici une exclusion générale de rétractation de quinze jours pour tout circuit à date déterminée ; les conditions applicables doivent être précisées dans le contrat. Le Code du Tourisme et ses textes d’application prévoient des obligations d’information claire sur les prestations et les prix.',
    refs: 'Références :',
    lawLink: 'loi n° 2015-014',
    decreeLink: 'décret n° 2001-027, article 26',
    footer: 'Cette page résume notre procédure d’information. Les conditions contractuelles remises avant réservation prévalent pour chaque prestation, sous réserve des dispositions légales applicables.',
  },
  en: {
    title: 'Cancellation and refund',
    description: 'Cancellation and refund policy for ANABO Roadtrip Madagascar trips: 15-day rule, early departure, how to cancel and refunds.',
    intro: 'Conditions shared before you book, adapted to the services you actually book.',
    depositTitle: 'Deposit and payment',
    deposit: (p) => `A deposit of ${p}% of the total quote is required to confirm the booking.`,
    depositHow: (m, ph, h) => `Payment by ${m} to ${ph}${h ? ` (account holder: ${h})` : ''}, using your quote reference as the payment description.`,
    depositFinal: 'The booking becomes final once the deposit has been received. The balance is paid as set out in the accepted quote.',
    delaysTitle: 'Cancellation periods',
    delays: [
      ['Before the quote is accepted:', 'your quote request is free of charge and can be withdrawn at any time.'],
      ['How the period is calculated:', 'the period runs from the date the client confirms and accepts the quote to the requested departure date.'],
      ['Accepted at least 15 calendar days before departure:', 'a cancellation can be requested using the procedure below. Refundable amounts and any costs already incurred with third-party providers are set out in the accepted quote.'],
      ['Accepted less than 15 calendar days before departure:', 'if the quote is accepted less than 15 calendar days before the requested departure date, the booking cannot be cancelled under the usual procedure. You are reminded of this before confirming.'],
    ],
    noFlatFee: 'No flat cancellation fee is ever added without being announced and accepted.',
    earlyTitle: 'Early departure',
    early: 'If you leave the trip before the originally agreed return date, no refund will be given for unused days.',
    traceTitle: 'Record of your acceptance',
    trace: [
      'When you confirm your quote from your personal, secure link, the exact date and time of your acceptance are recorded automatically. They are the reference for calculating the 15-day period and allow that calculation to be justified in the event of a dispute.',
      'The travel dates accepted at that moment are also kept, even if they are later changed by mutual agreement.',
    ],
    howTitle: 'How to request a cancellation',
    how: (email) => <>Write to {email} stating your reference, the name of the lead traveller and the services concerned. We will acknowledge your request by e-mail and explain the next steps, along with the calculation of any refundable amounts. Your personal tracking link is in the confirmation e-mail for your request.</>,
    mailSubject: 'Cancellation request',
    refundTitle: 'Refunds and exceptional circumstances',
    refund: [
      'When a refund is due, we confirm its amount and the refund method in writing. Wherever possible, it is made using the original payment method within 30 days of written agreement on the amount, subject to payment providers’ processing times.',
      'In the event of force majeure or any event preventing the trip, contact us without delay. We will review the situation, the services concerned and the applicable rules, then propose the solutions and refunds provided for by the contract and the law. A credit note never replaces a refund that is due without your consent.',
    ],
    lawTitle: 'About the applicable legislation',
    law: 'Malagasy Law No. 2015-014 provides, in particular in Article 30, a period of fifteen clear days to return a non-compliant product. This provision is not a general withdrawal period applicable to tourism services. The Malagasy texts consulted do not support stating here a general exclusion of a fifteen-day withdrawal right for every tour on a fixed date; the applicable conditions must be set out in the contract. The Tourism Code and its implementing texts require clear information on services and prices.',
    refs: 'References:',
    lawLink: 'Law No. 2015-014',
    decreeLink: 'Decree No. 2001-027, Article 26',
    footer: 'This page summarises our information procedure. The contractual terms provided before booking prevail for each service, subject to applicable legal provisions.',
  },
  it: {
    title: 'Cancellazione e rimborso',
    description: 'Condizioni di cancellazione e rimborso dei viaggi ANABO Roadtrip Madagascar: regola dei 15 giorni, partenza anticipata, procedura e rimborsi.',
    intro: 'Condizioni comunicate prima della prenotazione, adattate ai servizi effettivamente prenotati.',
    depositTitle: 'Acconto e pagamento',
    deposit: (p) => `Per confermare la prenotazione è richiesto un acconto del ${p}% dell’importo totale del preventivo.`,
    depositHow: (m, ph, h) => `Pagamento tramite ${m} al numero ${ph}${h ? ` (intestatario: ${h})` : ''}, indicando il riferimento del preventivo come causale.`,
    depositFinal: 'La prenotazione diventa definitiva al ricevimento dell’acconto. Il saldo si paga secondo le modalità indicate nel preventivo accettato.',
    delaysTitle: 'Termini di cancellazione',
    delays: [
      ['Prima dell’accettazione del preventivo:', 'la richiesta di preventivo è gratuita e può essere ritirata in qualsiasi momento.'],
      ['Calcolo del termine:', 'il termine si calcola tra la data di conferma e accettazione del preventivo da parte del cliente e la data di partenza richiesta.'],
      ['Accettazione almeno 15 giorni di calendario prima della partenza:', 'è possibile richiedere la cancellazione secondo la procedura indicata di seguito. Gli importi rimborsabili e gli eventuali costi già sostenuti presso fornitori terzi sono indicati nel preventivo accettato.'],
      ['Accettazione a meno di 15 giorni di calendario dalla partenza:', 'se il preventivo viene accettato a meno di 15 giorni di calendario dalla partenza richiesta, la prenotazione non può essere cancellata secondo la procedura abituale. Questa informazione vi viene ricordata prima di ogni conferma.'],
    ],
    noFlatFee: 'Nessuna penale forfettaria di cancellazione viene aggiunta senza essere stata comunicata e accettata.',
    earlyTitle: 'Partenza anticipata',
    early: 'Se lasciate il viaggio prima della data di ritorno inizialmente concordata, non è previsto alcun rimborso per i giorni non utilizzati.',
    traceTitle: 'Tracciabilità della vostra accettazione',
    trace: [
      'Quando confermate il preventivo dal vostro link personale e sicuro, la data e l’ora esatte dell’accettazione vengono registrate automaticamente. Fanno da riferimento per il calcolo del termine di 15 giorni e permettono di giustificarlo in caso di contestazione.',
      'Anche le date di viaggio accettate in quel momento vengono conservate, pur se modificate in seguito di comune accordo.',
    ],
    howTitle: 'Come richiedere una cancellazione',
    how: (email) => <>Scrivete a {email} indicando il vostro riferimento, il nome del viaggiatore principale e i servizi interessati. Vi confermeremo la ricezione via e-mail e vi indicheremo i passi successivi, insieme al calcolo degli eventuali importi rimborsabili. Il link di monitoraggio personale si trova nell’e-mail di conferma della vostra richiesta.</>,
    mailSubject: 'Richiesta di cancellazione',
    refundTitle: 'Rimborsi e circostanze eccezionali',
    refund: [
      'Quando è dovuto un rimborso, ne confermiamo per iscritto l’importo e la modalità. Viene effettuato, per quanto possibile, con il mezzo di pagamento originale entro 30 giorni dall’accordo scritto sull’importo, salvo i tempi dei fornitori di pagamento.',
      'In caso di forza maggiore o di eventi che impediscano il viaggio, contattateci senza indugio. Esamineremo la situazione, i servizi interessati e le regole applicabili, quindi proporremo le soluzioni e i rimborsi previsti dal contratto e dalla legge. Nessun buono sostituisce un rimborso dovuto senza il vostro consenso.',
    ],
    lawTitle: 'Informazioni sulla normativa applicabile',
    law: 'La legge malgascia n. 2015-014 prevede in particolare, all’articolo 30, un termine di quindici giorni pieni per restituire un prodotto non conforme. Questa disposizione non costituisce un termine generale di recesso applicabile ai servizi turistici. I testi malgasci consultati non consentono di affermare un’esclusione generale del recesso di quindici giorni per ogni tour a data fissa; le condizioni applicabili devono essere precisate nel contratto. Il Codice del Turismo e i relativi testi di attuazione prevedono obblighi di informazione chiara su servizi e prezzi.',
    refs: 'Riferimenti:',
    lawLink: 'legge n. 2015-014',
    decreeLink: 'decreto n. 2001-027, articolo 26',
    footer: 'Questa pagina riassume la nostra procedura informativa. Le condizioni contrattuali fornite prima della prenotazione prevalgono per ciascun servizio, fatte salve le disposizioni di legge applicabili.',
  },
}

function getContent(locale: string) {
  if (!locales.includes(locale as Locale)) return null
  return CONTENT[locale as Locale]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const c = getContent(locale)
  if (!c) return {}
  return {
    title: c.title,
    description: c.description,
    alternates: pageAlternates(locale, '/annulation'),
    openGraph: { title: c.title, description: c.description, url: `/${locale}/annulation` },
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const card = 'rounded-2xl border border-slate-200 bg-white p-6'
const h2 = 'text-2xl font-semibold text-[#06245F]'

export default async function CancellationPage({ params }: Props) {
  const { locale } = await params
  const c = getContent(locale)
  if (!c) notFound()
  const payment = await getPaymentSettings()

  const email = (
    <a className="font-semibold text-blue-800 underline" href={`mailto:contact@anabo.mg?subject=${encodeURIComponent(c.mailSubject)}`}>
      contact@anabo.mg
    </a>
  )

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-16 text-slate-800">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">ANABO Roadtrip Madagascar</p>
        <h1 className="mt-2 text-4xl font-bold text-[#06245F]">{c.title}</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{c.intro}</p>
      </header>

      {payment.depositPercent > 0 && (
        <section className={card}>
          <h2 className={h2}>{c.depositTitle}</h2>
          <p className="mt-3 leading-7">{c.deposit(payment.depositPercent)}</p>
          <p className="mt-2 leading-7">{c.depositHow(payment.method, payment.phoneNumber, payment.accountHolder)}</p>
          <p className="mt-2 leading-7">{c.depositFinal}</p>
        </section>
      )}

      <section className={card}>
        <h2 className={h2}>{c.delaysTitle}</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-6 leading-7">
          {c.delays.map(([label, text]) => (
            <li key={label}>
              <strong>{label}</strong> {text}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm leading-6 text-slate-600">{c.noFlatFee}</p>
      </section>

      <section className={card}>
        <h2 className={h2}>{c.earlyTitle}</h2>
        <p className="mt-3 leading-7">{c.early}</p>
      </section>

      <section className={card}>
        <h2 className={h2}>{c.traceTitle}</h2>
        {c.trace.map((text) => (
          <p key={text.slice(0, 20)} className="mt-3 leading-7">{text}</p>
        ))}
      </section>

      <section className={card}>
        <h2 className={h2}>{c.howTitle}</h2>
        <p className="mt-3 leading-7">{c.how(email)}</p>
      </section>

      <section className={card}>
        <h2 className={h2}>{c.refundTitle}</h2>
        {c.refund.map((text) => (
          <p key={text.slice(0, 20)} className="mt-3 leading-7">{text}</p>
        ))}
      </section>

      <aside className="rounded-2xl bg-amber-50 p-6 text-sm leading-6 text-amber-950">
        <h2 className="font-semibold">{c.lawTitle}</h2>
        <p className="mt-2">{c.law}</p>
        <p className="mt-2">
          {c.refs}{' '}
          <a className="underline" href={LEX} target="_blank" rel="noreferrer">{c.lawLink}</a> ;{' '}
          <a className="underline" href={DECREE} target="_blank" rel="noreferrer">{c.decreeLink}</a>.
        </p>
      </aside>

      <p className="text-xs text-slate-500 dark:text-slate-400">{c.footer}</p>
    </div>
  )
}
