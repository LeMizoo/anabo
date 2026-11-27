import { formatMgDateTime, formatTimestamp, formatTripDate } from '@/lib/datetime'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { StatusUpdateForm } from '@/components/admin/StatusUpdateForm'
import { FormSubmitButton } from '@/components/admin/FormSubmitButton'
import {
  saveQuoteDetails,
  saveTripPlanning,
} from '@/app/admin/actions'
import type { RoadCondition } from '@/generated/prisma/enums'
import type { QuoteEstimateSnapshot } from '@/lib/pricing'
import { parseVehicleEstimateSnapshot } from '@/lib/trip-pricing'
import { quoteStatusColor, quoteStatusLabel, whatsappDigits } from '@/lib/quote-status'
import { signQuoteToken } from '@/lib/quote-token'
import { SITE_URL } from '@/lib/site'
import { CopyButton } from '@/components/admin/CopyButton'
import { PrintButton } from '@/components/admin/PrintButton'
import { DeleteQuoteForm } from '@/components/admin/DeleteQuoteForm'
import { getCancellationStatus } from '@/lib/cancellation'
import { assignDriver } from '@/app/admin/(protected)/chauffeurs/actions'
import { shortageForTrip } from '@/lib/fleet-capacity'
import { archiveQuotes, saveQuotePayment, toggleBalancePaid, toggleDepositPaid, toggleDriverPaid, unarchiveQuotes } from '@/app/admin/actions'
import { estimateSplit } from '@/lib/accounting'
import { getPaymentSettings, depositAmount, formatAmount } from '@/lib/payment-settings'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

function parseEstimate(value: string | null): QuoteEstimateSnapshot | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as QuoteEstimateSnapshot

    return (parsed.version === 1 || parsed.version === 2) &&
      typeof parsed.finalPrice === 'number' &&
      typeof parsed.currency === 'string'
      ? parsed
      : null
  } catch {
    return null
  }
}

function parseVehicleEstimate(value: string | null) {
  if (!value) return null

  try {
    return parseVehicleEstimateSnapshot(JSON.parse(value))
  } catch {
    return null
  }
}

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${value.toLocaleString('fr-FR')} ${currency}`
  }
}

function getSeason(date: Date | null) {
  if (!date) return null

  const month = date.getUTCMonth() + 1
  return month >= 5 && month <= 10 ? 'DRY' : 'RAINY'
}

function getSeasonLabel(season: string | null) {
  if (season === 'DRY') return 'Saison sèche (mai à octobre)'
  if (season === 'RAINY') return 'Saison des pluies (novembre à avril)'
  return 'Date de départ non renseignée'
}

function getRoadConditionLabel(condition: string | null) {
  if (condition === 'GOOD') return 'Bon'
  if (condition === 'MEDIUM') return 'Moyen'
  if (condition === 'DIFFICULT') return 'Difficile'
  return 'Non renseigné'
}

async function save(formData: FormData) {
  'use server'

  const id = String(formData.get('id') || '')
  const quoteDetails = String(formData.get('quoteDetails') || '')
  const adminNotes = String(formData.get('adminNotes') || '')

  if (!id) return

  await saveQuoteDetails(id, quoteDetails, adminNotes)
  redirect(`/admin/demandes/${id}`)
}

async function saveTripPlanningForm(formData: FormData) {
  'use server'

  const id = String(formData.get('id') || '')
  const roadCondition = String(formData.get('roadCondition') || '')
  const selectedDurationDays = Number(
    formData.get('selectedDurationDays'),
  )

  if (!id) return

  await saveTripPlanning(
    id,
    roadCondition as RoadCondition,
    selectedDurationDays,
  )

  redirect(`/admin/demandes/${id}`)
}

export default async function AdminDemandeDetailPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const quote = await prisma.quoteRequest.findUnique({ where: { id } })

  if (!quote) notFound()

  const isSuperAdmin = (session.user as { role?: string })?.role === 'SUPER_ADMIN'
  const otherQuotes = await prisma.quoteRequest.findMany({
    where: { email: quote.email, NOT: { id: quote.id } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, reference: true, status: true, createdAt: true, circuitTitle: true },
  })
  let clientLink: string | null = null
  try {
    const lang = ['fr', 'en', 'it'].includes(quote.locale) ? quote.locale : 'fr'
    clientLink = `${SITE_URL}/${lang}/devis/${encodeURIComponent(quote.reference)}?token=${signQuoteToken(quote.id)}`
  } catch {
    clientLink = null
  }
  const timeline = [
    { label: 'Demande reçue', date: quote.createdAt, done: true },
    { label: 'Client contacté', date: quote.contactedAt, done: !!quote.contactedAt },
    { label: 'Devis envoyé', date: quote.quoteSentAt, done: !!quote.quoteSentAt },
    quote.lostAt
      ? { label: 'Demande perdue', date: quote.lostAt, done: true, lost: true }
      : { label: 'Voyage confirmé', date: quote.confirmedAt, done: !!quote.confirmedAt },
  ]
  const firstReplyHours = quote.contactedAt
    ? Math.round((quote.contactedAt.getTime() - quote.createdAt.getTime()) / 3_600_000)
    : null

  const [drivers, shortage] = await Promise.all([
    prisma.driver.findMany({
      where: { OR: [{ active: true }, ...(quote.assignedDriverId ? [{ id: quote.assignedDriverId }] : [])] },
      orderBy: [{ isTemporary: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, isTemporary: true, vehicleLabel: true, vehicleSeats: true, phone: true, active: true },
    }),
    quote.status === 'CONFIRME' ? shortageForTrip(quote.id) : Promise.resolve(null),
  ])
  const assignedDriver = drivers.find((d) => d.id === quote.assignedDriverId) || null

  const payment = await getPaymentSettings()
  const deposit = depositAmount(quote.quoteTotalAmount, payment.depositPercent)

  const acceptance = getCancellationStatus(quote.clientAcceptedAt, quote.acceptedStartDate || quote.startDate)
  // Horodatages : heure de Madagascar (GMT+3) + équivalent GMT. Dates de voyage : UTC.
  const mgDateTime = (d: Date) => formatTimestamp(d, 'fr')
  const datesChanged =
    !!quote.acceptedStartDate &&
    (quote.acceptedStartDate.getTime() !== quote.startDate?.getTime() ||
      (quote.acceptedEndDate?.getTime() ?? null) !== (quote.endDate?.getTime() ?? null))

  // Ventilation comptable : saisie, sinon proposée d'après l'estimation.
  const hasSplit = quote.vehicleAmount !== null || quote.driverAmount !== null || quote.otherAmount !== null
  const proposedSplit = hasSplit ? null : estimateSplit(quote.estimateDetails)
  const splitDefault = {
    vehicle: quote.vehicleAmount ?? proposedSplit?.vehicle ?? '',
    driver: quote.driverAmount ?? proposedSplit?.driver ?? '',
    other: quote.otherAmount ?? (proposedSplit ? 0 : ''),
  }

  const estimate = parseEstimate(quote.estimateDetails)
  const vehicleEstimate = parseVehicleEstimate(quote.estimateDetails)
  const proposedCurrency = vehicleEstimate?.currency ?? null
  const season = getSeason(quote.startDate)

  const vehicleCost =
    typeof vehicleEstimate?.vehicleCost === 'number'
      ? vehicleEstimate.vehicleCost
      : vehicleEstimate
        ? vehicleEstimate.pricePerDay * vehicleEstimate.days * vehicleEstimate.vehicleCount
        : 0

  const driverRatePerDay =
    typeof vehicleEstimate?.driverRatePerDay === 'number'
      ? vehicleEstimate.driverRatePerDay
      : 30

  const driverCost =
    typeof vehicleEstimate?.driverCost === 'number'
      ? vehicleEstimate.driverCost
      : vehicleEstimate
        ? vehicleEstimate.days * driverRatePerDay * vehicleEstimate.vehicleCount
        : 0

  const emptyReturnDays = vehicleEstimate?.emptyReturn?.returnDays ?? 0
  const emptyReturnDestination = vehicleEstimate?.emptyReturn?.destinationLabel ?? null
  const emptyReturnVehicleCost =
    typeof vehicleEstimate?.emptyReturn?.vehicleCost === 'number'
      ? vehicleEstimate.emptyReturn.vehicleCost
      : vehicleEstimate && emptyReturnDays > 0
        ? emptyReturnDays * vehicleEstimate.pricePerDay * vehicleEstimate.vehicleCount
        : 0
  const emptyReturnDriverCost =
    typeof vehicleEstimate?.emptyReturn?.driverCost === 'number'
      ? vehicleEstimate.emptyReturn.driverCost
      : vehicleEstimate && emptyReturnDays > 0
        ? emptyReturnDays * driverRatePerDay * vehicleEstimate.vehicleCount
        : 0
  const emptyReturnTotal =
    typeof vehicleEstimate?.emptyReturn?.total === 'number'
      ? vehicleEstimate.emptyReturn.total
      : emptyReturnVehicleCost + emptyReturnDriverCost

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Demande {quote.reference}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {quote.firstName} {quote.lastName} — {quote.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <PrintButton />
          <a
            href={`mailto:${quote.email}?subject=${encodeURIComponent(`Votre demande ${quote.reference}`)}`}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            E-mail
          </a>
          <a
            href={`https://wa.me/${whatsappDigits(quote.phone)}?text=${encodeURIComponent(`Bonjour ${quote.firstName}, je reviens vers vous concernant votre demande ${quote.reference}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100"
          >
            WhatsApp
          </a>
          <a
            href={`tel:${quote.phone.replace(/[^\d+]/g, '')}`}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Appeler
          </a>
          <form action={quote.archivedAt ? unarchiveQuotes : archiveQuotes}>
            <input type="hidden" name="ids" value={quote.id} />
            <input type="hidden" name="returnTo" value={`/admin/demandes/${quote.id}`} />
            <button
              type="submit"
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {quote.archivedAt ? 'Désarchiver' : 'Archiver'}
            </button>
          </form>
          <Link
            href={quote.archivedAt ? '/admin/demandes?vue=archives' : '/admin/demandes'}
            className="ml-2 text-sm font-medium text-blue-600 hover:underline"
          >
            ← Retour à la liste
          </Link>
        </div>
      </div>

      {quote.archivedAt && (
        <div className="rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Demande archivée</strong> le {formatTimestamp(quote.archivedAt, 'fr')}
          {quote.archivedBy ? ` par ${quote.archivedBy}` : ''}. Elle n’apparaît plus dans les listes de travail ni dans
          les alertes ; elle redevient active si vous la désarchivez ou si le client accepte son devis.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              Détails de la demande
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Statut actuel</dt>
                <dd className="mt-1">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${quoteStatusColor(quote.status)}`}>
                    {quoteStatusLabel(quote.status)}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">Téléphone</dt>
                <dd className="mt-1 text-gray-900">{quote.phone}</dd>
              </div>

              <div>
                <dt className="text-gray-500">Pays</dt>
                <dd className="mt-1 text-gray-900">
                  {quote.country || '—'}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">Circuit</dt>
                <dd className="mt-1 text-gray-900">
                  {quote.circuitTitle || quote.circuitSlug || '—'}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">Dates</dt>
                <dd className="mt-1 text-gray-900">
                  {formatTripDate(quote.startDate)}
                  {' → '}
                  {formatTripDate(quote.endDate)}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">Voyageurs</dt>
                <dd className="mt-1 text-gray-900">
                  {quote.adults} ad. / {quote.children} enf.
                </dd>
              </div>

              {quote.vehicleCode && (
                <div>
                  <dt className="text-gray-500">Véhicule demandé</dt>
                  <dd className="mt-1 text-gray-900">
                    {quote.vehicleLabel || quote.vehicleCode}{' '}
                    <span className="text-gray-500">
                      [{quote.vehicleCode}]
                    </span>{' '}
                    · {quote.vehicleCount} véhicule(s) ·{' '}
                    {quote.consecutiveCircuits} circuit(s) consécutif(s)
                  </dd>
                </div>
              )}

              {quote.pricingMode && (
                <div>
                  <dt className="text-gray-500">Mode demandé</dt>
                  <dd className="mt-1 text-gray-900">
                    {quote.pricingMode === 'DAILY_CAR'
                      ? 'Daily price car'
                      : 'Tour price (included vehicle)'}
                  </dd>
                </div>
              )}

              {quote.pricingPackageName && (
                <div>
                  <dt className="text-gray-500">Package demandé</dt>
                  <dd className="mt-1 text-gray-900">
                    {quote.pricingPackageName}
                  </dd>
                </div>
              )}

              <div className="sm:col-span-2">
                <dt className="text-gray-500">Message</dt>
                <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                  {quote.message || '—'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-blue-950">
                Préparation du voyage
              </h2>
              <p className="mt-1 text-sm text-blue-900">
                Définissez les conditions de route et la durée réelle prévue
                pour ce voyage. La saison est déterminée automatiquement
                à partir de la date de départ.
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-white p-4">
              <p className="text-sm text-gray-500">Saison calculée</p>
              <p className="mt-1 font-semibold text-gray-900">
                {getSeasonLabel(season)}
              </p>
              {quote.startDate && (
                <p className="mt-1 text-xs text-gray-500">
                  Départ le{' '}
                  {formatTripDate(quote.startDate)}
                </p>
              )}
            </div>

            <form action={saveTripPlanningForm} className="space-y-4">
              <input type="hidden" name="id" value={quote.id} />

              <div>
                <label
                  htmlFor="roadCondition"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  État des routes
                </label>
                <select
                  id="roadCondition"
                  name="roadCondition"
                  required
                  defaultValue={quote.roadCondition || ''}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="" disabled>
                    Sélectionner l&apos;état des routes
                  </option>
                  <option value="GOOD">Bon</option>
                  <option value="MEDIUM">Moyen</option>
                  <option value="DIFFICULT">Difficile</option>
                </select>
              </div>

              <div className="rounded-lg border border-blue-200 bg-white p-4">
                <p className="text-sm font-medium text-gray-900">
                  Durée indicative configurée
                </p>

                {quote.indicativeMinDays !== null &&
                quote.indicativeMaxDays !== null ? (
                  <p className="mt-1 text-lg font-semibold text-blue-900">
                    {quote.indicativeMinDays} à {quote.indicativeMaxDays}{' '}
                    jours
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gray-600">
                    Aucune fourchette enregistrée pour cette combinaison.
                    Vérifiez la configuration du circuit dans Prix.
                  </p>
                )}

                {quote.roadCondition && (
                  <p className="mt-2 text-xs text-gray-500">
                    Conditions enregistrées :{' '}
                    {getRoadConditionLabel(quote.roadCondition)}
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  La fourchette indicative est mise à jour après
                  l&apos;enregistrement de l&apos;état des routes.
                </p>
              </div>

              <div>
                <label
                  htmlFor="selectedDurationDays"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Durée définitive retenue (en jours)
                </label>
                <input
                  id="selectedDurationDays"
                  name="selectedDurationDays"
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  required
                  defaultValue={quote.selectedDurationDays ?? ''}
                  placeholder="Ex. : 9"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Cette durée reste libre : vous pouvez choisir une valeur
                  inférieure ou supérieure à la fourchette indicative.
                </p>
              </div>

              <div className="flex justify-end">
                <FormSubmitButton
                  label="Enregistrer la préparation du voyage"
                  pendingLabel="Enregistrement..."
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </form>
          </section>

          {vehicleEstimate && (
            <section className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-green-950">
                    Estimation indicative reçue (véhicule, chauffeur &amp; retour à vide)
                  </h2>
                  <p className="mt-1 text-sm text-green-800">
                    Calculée côté serveur le{' '}
                    {formatMgDateTime(vehicleEstimate.calculatedAt)} (GMT+3)
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-950">
                  {formatMoney(vehicleEstimate.total, vehicleEstimate.currency)}
                </p>
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-green-800">Véhicule</dt>
                  <dd className="mt-1 font-medium text-green-950">
                    {vehicleEstimate.vehicleName} [{vehicleEstimate.vehicleCode}]
                    · {vehicleEstimate.capacity} pers. · {vehicleEstimate.vehicleCount} véhicule(s)
                  </dd>
                </div>

                <div>
                  <dt className="text-green-800">Tarifs journaliers</dt>
                  <dd className="mt-1 font-medium text-green-950">
                    Véhicule : {formatMoney(vehicleEstimate.pricePerDay, vehicleEstimate.currency)} / j · Chauffeur : {formatMoney(driverRatePerDay, vehicleEstimate.currency)} / j
                  </dd>
                </div>

                <div>
                  <dt className="text-green-800">Location véhicule ({vehicleEstimate.days} j)</dt>
                  <dd className="mt-1 font-semibold text-green-950">
                    {formatMoney(vehicleCost, vehicleEstimate.currency)}
                    <span className="block text-xs font-normal text-green-800">
                      {formatMoney(vehicleEstimate.pricePerDay, vehicleEstimate.currency)} × {vehicleEstimate.days} j × {vehicleEstimate.vehicleCount} véhicule(s)
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-green-800">Indemnité chauffeur ({vehicleEstimate.days} j)</dt>
                  <dd className="mt-1 font-semibold text-green-950">
                    {formatMoney(driverCost, vehicleEstimate.currency)}
                    <span className="block text-xs font-normal text-green-800">
                      {formatMoney(driverRatePerDay, vehicleEstimate.currency)} × {vehicleEstimate.days} j × {vehicleEstimate.vehicleCount} véhicule(s)
                    </span>
                  </dd>
                </div>

                <div className="sm:col-span-2 rounded-lg border border-green-200 bg-white/80 p-3">
                  <dt className="font-medium text-green-900">
                    Retour à vide Antananarivo
                    {emptyReturnDestination ? ` — ${emptyReturnDestination}` : ''}
                    {' '}({emptyReturnDays} j)
                  </dt>
                  {emptyReturnDays > 0 ? (
                    <dd className="mt-1.5 space-y-1 text-green-950">
                      <p className="font-semibold">
                        Total retour à vide : {formatMoney(emptyReturnTotal, vehicleEstimate.currency)}
                      </p>
                      <p className="text-xs text-green-800">
                        Véhicule ({emptyReturnDays} j) : {formatMoney(emptyReturnVehicleCost, vehicleEstimate.currency)} · Chauffeur ({emptyReturnDays} j) : {formatMoney(emptyReturnDriverCost, vehicleEstimate.currency)}
                      </p>
                      {vehicleEstimate.emptyReturn?.vehicleFerryNotIncluded && (
                        <p className="text-xs font-semibold text-amber-800">
                          Véhicule embarqué vers Nosy Be : frais de bac du véhicule (Ankify ↔ Nosy Be) à ajouter au devis.
                        </p>
                      )}
                    </dd>
                  ) : (
                    <dd className="mt-1 text-xs text-green-800">
                      Aucun jour de retour à vide appliqué (0 j — {formatMoney(0, vehicleEstimate.currency)}).
                    </dd>
                  )}
                </div>
              </dl>

              {vehicleEstimate.indicativeOnly && (
                <p className="mt-3 text-sm text-green-800">
                  Tarif indicatif : confirmer disponibilité et saison.
                </p>
              )}
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                ⛽ Carburant non inclus : à la charge du client pendant tout le voyage, y compris les
                transferts et les jours de retour à vide. À rappeler dans le devis.
              </p>
            </section>
          )}

          {estimate && (
            <section className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-green-950">
                    Estimation indicative reçue
                  </h2>
                  <p className="mt-1 text-sm text-green-800">
                    Calculée côté serveur le{' '}
                    {formatMgDateTime(estimate.calculatedAt)} (GMT+3)
                  </p>
                </div>

                <p className="text-2xl font-bold text-green-950">
                  {formatMoney(estimate.finalPrice, estimate.currency)}
                </p>
              </div>

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-green-800">Voyageurs</dt>
                  <dd className="mt-1 font-medium text-gray-900">
                    {estimate.adults} adulte(s), {estimate.children} enfant(s)
                    {' — '}
                    {estimate.people} au total
                  </dd>
                </div>

                <div>
                  <dt className="text-green-800">Durée et demandes</dt>
                  <dd className="mt-1 font-medium text-gray-900">
                    {estimate.days} jour(s), {estimate.consecutiveCircuits}{' '}
                    circuit(s) consécutif(s), {estimate.vehicleCount}{' '}
                    véhicule(s) demandé(s)
                  </dd>
                </div>

                <div>
                  <dt className="text-green-800">
                    {estimate.pricingMode === 'TOUR_INCLUDED'
                      ? 'Prix global du circuit (véhicule inclus)'
                      : 'Base historique'}
                  </dt>
                  <dd className="mt-1 font-medium text-gray-900">
                    {estimate.pricingMode === 'TOUR_INCLUDED'
                      ? formatMoney(estimate.baseTotal, estimate.currency)
                      : `${formatMoney(estimate.basePricePerPerson, estimate.currency)} × ${estimate.people} = ${formatMoney(estimate.baseTotal, estimate.currency)}`}
                  </dd>
                </div>

                {estimate.vehicle && (
                  <div>
                    <dt className="text-green-800">Location véhicule</dt>
                    <dd className="mt-1 font-medium text-gray-900">
                      {estimate.vehicle.label} [tarif {estimate.vehicle.code}
                      {estimate.vehicle.matchedOptionCode !==
                      estimate.vehicle.code
                        ? ` · option locale ${estimate.vehicle.matchedOptionCode}`
                        : ''}]
                      {' — '}
                      {estimate.vehicle.capacity} places,{' '}
                      {estimate.vehicle.vehiclesCharged} facturé(s),{' '}
                      {formatMoney(estimate.vehicle.total, estimate.currency)}
                      {estimate.vehicle.indicativeOnly
                        ? ' · tarif indicatif'
                        : ''}
                    </dd>
                  </div>
                )}

                {estimate.package && (
                  <div className="sm:col-span-2">
                    <dt className="text-green-800">
                      Package : {estimate.package.name}
                    </dt>
                    <dd className="mt-1 space-y-1 font-medium text-gray-900">
                      {estimate.package.items.map((item) => (
                        <p key={item.code}>
                          {item.name} —{' '}
                          {formatMoney(item.unitPrice, estimate.currency)} ×{' '}
                          {item.quantity} ={' '}
                          {formatMoney(item.total, estimate.currency)}
                        </p>
                      ))}
                      <p>
                        Total package :{' '}
                        {formatMoney(
                          estimate.package.total,
                          estimate.currency,
                        )}
                      </p>
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-green-800">Sous-total</dt>
                  <dd className="mt-1 font-medium text-gray-900">
                    {formatMoney(estimate.subtotal, estimate.currency)}
                  </dd>
                </div>

                <div>
                  <dt className="text-green-800">Réductions appliquées</dt>
                  <dd className="mt-1 font-medium text-gray-900">
                    {estimate.discounts.multiplex.percentage > 0
                      ? `Multiplex −${estimate.discounts.multiplex.percentage}% (${formatMoney(estimate.discounts.multiplex.amount, estimate.currency)})`
                      : 'Multiplex : aucune'}
                    <br />
                    {estimate.discounts.fleet.percentage > 0
                      ? `Flotte −${estimate.discounts.fleet.percentage}% (${formatMoney(estimate.discounts.fleet.amount, estimate.currency)})`
                      : 'Flotte : aucune'}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 border-t border-green-200 pt-3 text-xs text-green-900">
                Le devis peut être ajusté selon les disponibilités, la saison
                et les échanges avec le client.
              </p>
            </section>
          )}

          {!estimate && quote.circuitSlug === 'sur-mesure' && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
              <h2 className="font-semibold">
                Aucune estimation automatique enregistrée
              </h2>
              <p className="mt-1">
                Vérifiez que le circuit « sur-mesure » possède un tarif et
                que la clé du véhicule sélectionné correspond à une clé ou
                à un alias configuré dans Prix et véhicules.
              </p>
            </section>
          )}

          <form
            action={save}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
          >
            <input type="hidden" name="id" value={quote.id} />

            <div>
              <label
                htmlFor="quote-details"
                className="mb-2 block text-lg font-semibold"
              >
                Rédiger le devis
              </label>
              <textarea
                id="quote-details"
                name="quoteDetails"
                defaultValue={quote.quoteDetails || ''}
                rows={8}
                maxLength={20000}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Contenu du devis envoyé au client..."
              />
            </div>

            <div>
              <label
                htmlFor="admin-notes"
                className="mb-2 block text-lg font-semibold"
              >
                Notes privées
              </label>
              <textarea
                id="admin-notes"
                name="adminNotes"
                defaultValue={quote.adminNotes || ''}
                rows={4}
                maxLength={20000}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Notes internes (non visibles par le client)..."
              />
            </div>

            <div className="flex justify-end">
              <FormSubmitButton
                label="Enregistrer le devis et les notes"
                pendingLabel="Enregistrement..."
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </form>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">
              Mise à jour du statut
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Assurez-vous d&apos;avoir enregistré le devis ci-dessus avant
              de changer le statut.
            </p>
            <StatusUpdateForm
              quoteId={quote.id}
              currentStatus={quote.status}
            />
          </section>
        </div>

        <aside className="space-y-4">
          <section className={`rounded-xl border p-6 shadow-sm text-sm ${quote.depositPaidAt ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
            <h2 className="mb-1 text-lg font-semibold">Acompte ({payment.depositPercent} %)</h2>
            <p className="mb-3 text-xs text-gray-600">
              {payment.method} · {payment.phoneNumber}
              {payment.accountHolder ? ` · ${payment.accountHolder}` : ' · titulaire à préciser'}
            </p>
            {/* Montant du voyage, ventilé pour la comptabilité. Si une part est saisie, le total en est la somme. */}
            <form action={saveQuotePayment} className="space-y-2 print:hidden">
              <input type="hidden" name="quoteId" value={quote.id} />
              {!hasSplit && proposedSplit && (
                <p className="rounded-lg bg-white/70 p-2 text-xs text-gray-600">
                  Ventilation proposée d’après l’estimation (retours à vide compris) : vérifiez puis enregistrez.
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-medium text-gray-700">
                  Location véhicule
                  <input name="vehicleAmount" type="number" min={0} step={1} defaultValue={splitDefault.vehicle}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm" />
                </label>
                <label className="text-xs font-medium text-gray-700">
                  Indemnité chauffeur
                  <input name="driverAmount" type="number" min={0} step={1} defaultValue={splitDefault.driver}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm" />
                </label>
                <label className="text-xs font-medium text-gray-700">
                  Autres frais <span className="font-normal text-gray-500">(bac, extras…)</span>
                  <input name="otherAmount" type="number" min={0} step={1} defaultValue={splitDefault.other}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm" />
                </label>
                <label className="text-xs font-medium text-gray-700">
                  Devise
                  <select name="quoteCurrency" defaultValue={quote.quoteCurrency || proposedCurrency || 'EUR'}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm">
                    <option value="EUR">EUR</option>
                    <option value="MGA">MGA</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
              </div>
              <details className="text-xs text-gray-600" open={!hasSplit && !proposedSplit && quote.quoteTotalAmount !== null}>
                <summary className="cursor-pointer">Saisir seulement un total, sans ventilation</summary>
                <label className="mt-1 block font-medium text-gray-700">
                  Montant total du devis
                  <input name="quoteTotalAmount" type="number" min={0} step={1} defaultValue={quote.quoteTotalAmount ?? ''}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm" />
                </label>
                <span className="mt-1 block text-gray-500">Utilisé uniquement si les trois parts ci-dessus sont vides.</span>
              </details>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-700">
                  Total : <strong>{quote.quoteTotalAmount !== null ? formatAmount(quote.quoteTotalAmount, quote.quoteCurrency) : 'non saisi'}</strong>
                  {quote.quoteTotalAmount !== null && !hasSplit && <span className="text-amber-700"> · non ventilé</span>}
                </p>
                <FormSubmitButton label="Enregistrer" pendingLabel="…" className="rounded-lg bg-blue-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60" />
              </div>
            </form>
            <p className="mt-3 text-gray-800">
              {deposit !== null
                ? <>Acompte demandé : <strong>{formatAmount(deposit, quote.quoteCurrency)}</strong></>
                : 'Renseignez le montant total pour afficher le montant exact de l’acompte au client.'}
            </p>
            <form action={toggleDepositPaid} className="mt-3 print:hidden">
              <input type="hidden" name="quoteId" value={quote.id} />
              {quote.depositPaidAt ? (
                <p className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Acompte reçu le {formatMgDateTime(quote.depositPaidAt)} (GMT+3)
                  </span>
                  <button className="text-xs text-gray-600 underline">Annuler</button>
                </p>
              ) : (
                <button className="rounded-lg border border-green-600 bg-white px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-50">
                  Marquer l’acompte comme reçu
                </button>
              )}
            </form>
            {/* Solde (reste après l'acompte) : suivi pour la comptabilité. */}
            {quote.quoteTotalAmount ? (
              <form action={toggleBalancePaid} className="mt-3 print:hidden">
                <input type="hidden" name="quoteId" value={quote.id} />
                <input type="hidden" name="returnTo" value={`/admin/demandes/${quote.id}`} />
                <p className="mb-1 text-gray-800">
                  Solde : <strong>{formatAmount(Math.max(quote.quoteTotalAmount - (deposit ?? 0), 0), quote.quoteCurrency)}</strong>
                </p>
                {quote.balancePaidAt ? (
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                      Solde reçu le {formatMgDateTime(quote.balancePaidAt)} (GMT+3)
                    </span>
                    <button className="text-xs text-gray-600 underline">Annuler</button>
                  </p>
                ) : (
                  <button className="rounded-lg border border-green-600 bg-white px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-50">
                    Marquer le solde comme reçu
                  </button>
                )}
              </form>
            ) : null}
          </section>

          {quote.status === 'CONFIRME' && (
            <section
              className={`rounded-xl border p-6 shadow-sm text-sm ${
                !quote.clientAcceptedAt
                  ? 'border-gray-200 bg-white'
                  : acceptance && !acceptance.cancellable
                    ? 'border-red-200 bg-red-50'
                    : 'border-green-200 bg-green-50'
              }`}
            >
              <h2 className="mb-2 text-lg font-semibold">Acceptation et annulation</h2>
              {quote.clientAcceptedAt ? (
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs text-gray-500">Accepté par le client (heure de Madagascar)</dt>
                    <dd className="font-medium text-gray-900">{mgDateTime(quote.clientAcceptedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Dates acceptées</dt>
                    <dd className="text-gray-900">
                      {formatTripDate(quote.acceptedStartDate)} →{' '}
                      {formatTripDate(quote.acceptedEndDate)}
                    </dd>
                  </div>
                  {datesChanged && (
                    <p className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
                      Dates modifiées par rapport à la demande initiale
                    </p>
                  )}
                  {acceptance && (
                    <div>
                      <dt className="text-xs text-gray-500">Délai d&apos;annulation</dt>
                      <dd className={`font-semibold ${acceptance.cancellable ? 'text-green-800' : 'text-red-800'}`}>
                        {acceptance.cancellable
                          ? `${acceptance.daysBeforeDeparture} j avant départ — annulable`
                          : acceptance.daysBeforeDeparture !== null
                            ? `${acceptance.daysBeforeDeparture} j avant départ — hors délai (< 15 j)`
                            : 'Date de départ non renseignée'}
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-gray-500">En attente de confirmation en ligne par le client.</p>
              )}
            </section>
          )}

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-sm">
            <h2 className="mb-3 text-lg font-semibold">Chauffeur assigné</h2>
            {assignedDriver && (
              <div className="mb-3 rounded-lg bg-blue-50 p-3">
                <p className="font-semibold text-blue-950">
                  {assignedDriver.name}
                  {assignedDriver.isTemporary && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900">
                      Renfort / temporaire
                    </span>
                  )}
                </p>
                <p className="text-xs text-blue-900">
                  {assignedDriver.vehicleLabel || 'Véhicule non précisé'}
                  {assignedDriver.vehicleSeats ? ` · ${assignedDriver.vehicleSeats} places` : ''}
                  {assignedDriver.phone ? ` · ${assignedDriver.phone}` : ''}
                </p>
              </div>
            )}
            {shortage && 'missing' in shortage && shortage.missing > 0 && (
              <p className="mb-3 rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-800">
                Capacité insuffisante sur ces dates : {shortage.required} véhicule(s) requis pour {shortage.capacity} place(s)/capacité ({shortage.missing} manquant(s)). Pensez à affecter un chauffeur temporaire.
              </p>
            )}
            {isSuperAdmin && hasSplit && (quote.driverAmount ?? 0) > 0 && (
              <form action={toggleDriverPaid} className="mb-3 print:hidden">
                <input type="hidden" name="quoteId" value={quote.id} />
                <input type="hidden" name="returnTo" value={`/admin/demandes/${quote.id}`} />
                <p className="mb-1 text-gray-800">
                  Indemnité à reverser : <strong>{formatAmount(quote.driverAmount ?? 0, quote.quoteCurrency)}</strong>
                </p>
                {quote.driverPaidAt ? (
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-semibold text-white">Versée le {formatMgDateTime(quote.driverPaidAt)}</span>
                    <button className="text-xs text-gray-600 underline">Annuler</button>
                  </p>
                ) : (
                  <button className="rounded-lg border border-green-600 bg-white px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-50">Marquer l’indemnité comme versée</button>
                )}
              </form>
            )}
            <form action={assignDriver} className="space-y-2 print:hidden">
              <input type="hidden" name="quoteId" value={quote.id} />
              <select
                name="driverId"
                defaultValue={quote.assignedDriverId || ''}
                aria-label="Chauffeur"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">— Aucun chauffeur —</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.isTemporary ? ' (temporaire)' : ''}{d.vehicleSeats ? ` — ${d.vehicleSeats} pl.` : ''}
                  </option>
                ))}
              </select>
              <FormSubmitButton label="Enregistrer" pendingLabel="…" className="w-full rounded-lg bg-blue-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60" />
            </form>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-sm">
            <h2 className="mb-3 text-lg font-semibold">Suivi</h2>
            <ol className="space-y-2.5">
              {timeline.map((step) => (
                <li key={step.label} className="flex items-start gap-2.5">
                  <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      step.lost ? 'bg-red-500' : step.done ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                  <div>
                    <p className={step.done ? 'font-medium text-gray-900' : 'text-gray-400'}>{step.label}</p>
                    {step.date && (
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(step.date, 'fr')}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            {firstReplyHours !== null && (
              <p className="mt-3 border-t border-gray-100 pt-2.5 text-xs text-gray-500">
                Première réponse : <strong>{firstReplyHours} h</strong> après réception
              </p>
            )}
          </section>

          {clientLink && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-sm print:hidden">
              <h2 className="mb-1 text-lg font-semibold">Lien client</h2>
              <p className="mb-3 text-xs text-gray-500">
                Permet au client de consulter et confirmer son devis en ligne.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={clientLink}
                  aria-label="Lien client"
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700"
                />
                <CopyButton value={clientLink} />
              </div>
              <Link
                href={clientLink.replace(SITE_URL, '')}
                target="_blank"
                className="mt-2 inline-block text-xs font-medium text-blue-700 hover:underline"
              >
                Ouvrir l&apos;aperçu client ↗
              </Link>
            </section>
          )}

          {otherQuotes.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-sm">
              <h2 className="mb-2 text-lg font-semibold">Autres demandes ({quote.email})</h2>
              <ul className="divide-y divide-gray-100">
                {otherQuotes.map((oq) => (
                  <li key={oq.id} className="py-2">
                    <Link href={`/admin/demandes/${oq.id}`} className="font-medium text-blue-700 hover:underline">
                      {oq.reference}
                    </Link>
                    <span className="ml-2 text-xs text-gray-500">{quoteStatusLabel(oq.status)}</span>
                    {oq.circuitTitle && <p className="truncate text-xs text-gray-500">{oq.circuitTitle}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isSuperAdmin && (
            <section className="rounded-xl border border-red-200 bg-red-50/50 p-5 print:hidden">
              <h2 className="mb-1 text-sm font-semibold text-red-900">Zone sensible</h2>
              <p className="mb-3 text-xs text-red-700">
                Supprime définitivement cette demande et son historique.
              </p>
              <DeleteQuoteForm quoteId={quote.id} reference={quote.reference} />
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}