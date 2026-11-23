import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales } from '@/lib/i18n'

// Le texte n'existe qu'en français : les versions /en et /it désignent
// /fr/annulation comme URL canonique pour éviter le contenu en double.
export const metadata: Metadata = {
  title: 'Annulation et remboursement',
  description: 'Conditions d’annulation et de remboursement des voyages ANABO Roadtrip Madagascar, location de voiture avec chauffeur-guide.',
  alternates: { canonical: '/fr/annulation' },
}

export default async function CancellationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!locales.includes(locale as (typeof locales)[number])) notFound()
  return <main className="mx-auto max-w-4xl space-y-8 px-4 py-16 text-slate-800">
    <header><p className="text-sm font-semibold uppercase tracking-wide text-amber-700">ANABO Roadtrip Madagascar</p><h1 className="mt-2 text-4xl font-bold text-[#06245F]">Annulation et remboursement</h1><p className="mt-4 text-lg text-slate-600">Des conditions communiquées avant votre réservation, adaptées aux prestations réellement réservées.</p></header>
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-semibold text-[#06245F]">Délais d’annulation</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-6 leading-7">
        <li><strong>Avant l’acceptation du devis :</strong> votre demande de devis est sans frais et peut être retirée à tout moment.</li>
        <li><strong>Calcul du délai :</strong> le délai est calculé entre la date de confirmation et d’acceptation du devis par le client et la date de départ souhaitée.</li>
        <li><strong>Acceptation au moins 15 jours calendaires avant le départ :</strong> une annulation peut être demandée selon la procédure ci-dessous. Les sommes remboursables et les éventuels frais déjà engagés auprès de prestataires tiers sont précisés dans le devis accepté.</li>
        <li><strong>Acceptation à moins de 15 jours calendaires avant le départ :</strong> si le devis est accepté moins de 15 jours calendaires avant le départ souhaité, la réservation ne peut pas être annulée dans le cadre de la procédure habituelle. Cette information vous est rappelée avant toute confirmation.</li>
      </ol>
      <p className="mt-4 text-sm leading-6 text-slate-600">Aucun frais forfaitaire d’annulation n’est ajouté sans avoir été annoncé et accepté.</p>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-semibold text-[#06245F]">Départ anticipé</h2>
      <p className="mt-3 leading-7">Si vous quittez le voyage avant la date de retour initialement convenue, aucun remboursement des jours non utilisés ne sera accordé.</p>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-semibold text-[#06245F]">Traçabilité de votre acceptation</h2>
      <p className="mt-3 leading-7">Lorsque vous confirmez votre devis depuis votre lien personnel et sécurisé, la date et l’heure exactes de votre acceptation sont enregistrées automatiquement. Elles servent de référence au calcul du délai de 15 jours et permettent de justifier ce calcul en cas de contestation.</p>
      <p className="mt-3 leading-7">Les dates de voyage acceptées à ce moment-là sont également conservées, même si elles sont modifiées ensuite d’un commun accord.</p>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-2xl font-semibold text-[#06245F]">Comment demander une annulation</h2><p className="mt-3 leading-7">Écrivez à <a className="font-semibold text-blue-800 underline" href="mailto:contact@anabo.mg?subject=Demande%20d’annulation">contact@anabo.mg</a> en indiquant votre référence, le nom du voyageur principal et les prestations concernées. Nous vous accusons réception par e-mail et vous indiquons les prochaines étapes ainsi que le calcul des sommes éventuellement remboursables. Le lien de suivi personnel figure dans l’e-mail de confirmation de votre demande.</p></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-2xl font-semibold text-[#06245F]">Remboursement et circonstances exceptionnelles</h2><p className="mt-3 leading-7">Lorsqu’un remboursement est dû, nous confirmons son montant et le moyen de remboursement par écrit. Il est effectué, dans la mesure du possible, par le moyen de paiement initial et dans les 30 jours suivant l’accord écrit sur son montant, sous réserve des délais des prestataires de paiement.</p><p className="mt-3 leading-7">En cas de force majeure ou d’événement empêchant le voyage, contactez-nous sans délai. Nous examinerons la situation, les prestations concernées et les règles applicables, puis proposerons les solutions et remboursements prévus par le contrat et la loi. Aucun avoir ne remplace un remboursement dû sans votre accord.</p></section>
    <aside className="rounded-2xl bg-amber-50 p-6 text-sm leading-6 text-amber-950"><h2 className="font-semibold">Information sur les textes applicables</h2><p className="mt-2">La loi malgache n° 2015-014 prévoit notamment, à son article 30, un délai de quinze jours francs pour retourner un produit non conforme. Cette disposition ne constitue pas un délai général de rétractation applicable aux prestations touristiques. Les textes malgaches consultés ne permettent pas d’affirmer ici une exclusion générale de rétractation de quinze jours pour tout circuit à date déterminée ; les conditions applicables doivent être précisées dans le contrat. Le Code du Tourisme et ses textes d’application prévoient des obligations d’information claire sur les prestations et les prix.</p><p className="mt-2">Références : <a className="underline" href="https://textes.lexxika.com/lois-malagasy/loi-n2015-014-du-10-aout-2015-sur-les-garanties-et-la-protection-des-consommateurs/" target="_blank" rel="noreferrer">loi n° 2015-014</a> ; <a className="underline" href="https://www.pic.commerce.mg/sites/default/files/2023-05/Madagascar-Decret-2001-27-normes-operateurs-touristiques_2.pdf" target="_blank" rel="noreferrer">décret n° 2001-027, article 26</a>.</p></aside>
    <p className="text-xs text-slate-500">Cette page résume notre procédure d’information. Les conditions contractuelles remises avant réservation prévalent pour chaque prestation, sous réserve des dispositions légales applicables.</p>
  </main>
}
