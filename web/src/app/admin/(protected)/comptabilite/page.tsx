import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Download } from 'lucide-react'
import { getCurrentAdmin } from '@/lib/admin-access'
import { getAccounting, getAccountingYears, type AccountingTrip, type CurrencyTotals } from '@/lib/accounting'
import { formatAmount } from '@/lib/payment-settings'
import { toggleBalancePaid, toggleDriverPaid } from '@/app/admin/actions'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ annee?: string }> }
type Key = Exclude<keyof CurrencyTotals, 'currency' | 'trips'>

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const fmtDate = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
const money = (n: number, c: string) => formatAmount(n, c)
/** Montant agrégé, devise par devise (« 1 000 € + 2 000 000 MGA ») ; « — » si rien. */
const multi = (list: CurrencyTotals[], key: Key) => {
  const parts = list.filter((c) => c[key] !== 0).map((c) => money(c[key], c.currency))
  return parts.length ? parts.join(' + ') : list.length ? money(0, list[0].currency) : '—'
}

function PaidBadge({ paidAt, label }: { paidAt: Date | null; label: string }) {
  return paidAt ? (
    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800" title={`Le ${fmtDate(paidAt)}`}>{label} ✓</span>
  ) : (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{label} en attente</span>
  )
}

function ToggleButton({ action, trip, year, done, labelOn, labelOff }: {
  action: (fd: FormData) => Promise<void>; trip: AccountingTrip; year: number; done: boolean; labelOn: string; labelOff: string
}) {
  return (
    <form action={action}>
      <input type="hidden" name="quoteId" value={trip.id} />
      <input type="hidden" name="returnTo" value={`/admin/comptabilite?annee=${year}`} />
      <button className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${done ? 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50' : 'border-green-300 bg-green-50 text-green-800 hover:bg-green-100'}`}>
        {done ? labelOff : labelOn}
      </button>
    </form>
  )
}

function Card({ title, value, lines }: { title: string; value: string; lines: [string, string][] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      <dl className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-xs">
        {lines.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-gray-500">{k}</dt>
            <dd className="text-right font-medium text-gray-800">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default async function AccountingPage({ searchParams }: Props) {
  const me = await getCurrentAdmin()
  if (!me || me.role !== 'SUPER_ADMIN') redirect('/admin/dashboard')

  const years = await getAccountingYears()
  const requested = Number((await searchParams).annee)
  const year = years.includes(requested) ? requested : new Date().getUTCFullYear()
  const data = await getAccounting(year)
  const T = data.totals
  const hasUnsplit = T.some((c) => c.unsplit > 0)
  const counted = T.reduce((n, c) => n + c.trips, 0)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Super-administration</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Comptabilité</h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-500">
            Voyages au statut « Confirmé » dont le départ a lieu dans l’année. Acompte = {data.depositPercent} % du total ; solde = total − acompte ;
            encaissé = acomptes et soldes marqués reçus. La ventilation (location, indemnité, autres frais) se saisit dans la fiche de chaque demande.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form className="flex items-center gap-2">
            <label htmlFor="annee" className="text-sm text-gray-600">Année</label>
            <select id="annee" name="annee" defaultValue={year} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm">
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Afficher</button>
          </form>
          <a href={`/admin/comptabilite/export?annee=${year}`} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800">
            <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          title="Chiffre d’affaires confirmé"
          value={multi(T, 'total')}
          lines={[
            ['Location véhicules', multi(T, 'vehicle')],
            ['Indemnités chauffeurs', multi(T, 'driver')],
            ['Autres frais', multi(T, 'other')],
            ...(hasUnsplit ? [['Non ventilé', multi(T, 'unsplit')] as [string, string]] : []),
            ['Voyages', `${counted}`],
          ]}
        />
        <Card
          title="Encaissé"
          value={multi(T, 'collected')}
          lines={[
            ['dont acomptes', multi(T, 'depositCollected')],
            ['dont soldes', multi(T, 'balanceCollected')],
          ]}
        />
        <Card
          title="Reste à encaisser"
          value={multi(T, 'remaining')}
          lines={[['Taux d’acompte', `${data.depositPercent} %`]]}
        />
        <Card
          title="Indemnités chauffeurs"
          value={multi(T, 'driver')}
          lines={[
            ['Versées', multi(T, 'driverPaid')],
            ['À verser', multi(T, 'driverDue')],
          ]}
        />
      </div>

      {data.missingAmount.length > 0 && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>{data.missingAmount.length} voyage(s) confirmé(s) sans montant</strong> : ils ne sont pas comptés. Saisissez le montant dans la fiche :{' '}
          {data.missingAmount.map((t, i) => (
            <span key={t.id}>{i > 0 && ', '}<Link href={`/admin/demandes/${t.id}`} className="font-semibold underline">{t.reference}</Link></span>
          ))}.
        </div>
      )}
      {data.unsplitTrips.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
          <strong>{data.unsplitTrips.length} voyage(s) non ventilé(s)</strong> : leur montant compte dans le chiffre d’affaires, mais pas dans la location, les indemnités ni les autres frais.
          Renseignez la ventilation dans la fiche :{' '}
          {data.unsplitTrips.map((t, i) => (
            <span key={t.id}>{i > 0 && ', '}<Link href={`/admin/demandes/${t.id}`} className="font-semibold underline">{t.reference}</Link></span>
          ))}.
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Par mois ({year})</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Mois</th>
                <th className="px-3 py-2 text-right font-medium">Voyages</th>
                <th className="px-3 py-2 text-right font-medium">Chiffre d’affaires</th>
                <th className="px-3 py-2 text-right font-medium">Location</th>
                <th className="px-3 py-2 text-right font-medium">Indemnités</th>
                <th className="px-3 py-2 text-right font-medium">Autres</th>
                <th className="px-3 py-2 text-right font-medium">Encaissé</th>
                <th className="px-4 py-2 text-right font-medium">Reste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...data.months.map((m) => ({ label: MONTHS[m.month], list: m.byCurrency, total: false })), { label: 'Total', list: T, total: true }].map((row) => (
                <tr key={row.label} className={row.total ? 'bg-gray-50 font-semibold text-gray-900' : row.list.length ? '' : 'text-gray-400'}>
                  <td className="px-4 py-2">{row.label}</td>
                  <td className="px-3 py-2 text-right">{row.list.reduce((n, c) => n + c.trips, 0) || '—'}</td>
                  {row.list.length ? (
                    <>
                      <td className="px-3 py-2 text-right">{multi(row.list, 'total')}</td>
                      <td className="px-3 py-2 text-right">{multi(row.list, 'vehicle')}</td>
                      <td className="px-3 py-2 text-right">{multi(row.list, 'driver')}</td>
                      <td className="px-3 py-2 text-right">{multi(row.list, 'other')}</td>
                      <td className="px-3 py-2 text-right">{multi(row.list, 'collected')}</td>
                      <td className="px-4 py-2 text-right">{multi(row.list, 'remaining')}</td>
                    </>
                  ) : (
                    Array.from({ length: 6 }, (_, i) => <td key={i} className="px-3 py-2 text-right">—</td>)
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Indemnités par chauffeur ({year})</h2>
        {data.drivers.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">Aucune indemnité ventilée pour {year}. Saisissez l’indemnité chauffeur dans la fiche des voyages confirmés.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Chauffeur</th>
                  <th className="px-3 py-2 text-right font-medium">Voyages</th>
                  <th className="px-3 py-2 text-right font-medium">Indemnités</th>
                  <th className="px-3 py-2 text-right font-medium">Versées</th>
                  <th className="px-4 py-2 text-right font-medium">À verser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.drivers.map((d) => (
                  <tr key={d.driverId ?? 'none'} className={d.driverId ? '' : 'text-orange-700'}>
                    <td className="px-4 py-2 font-medium">{d.name}</td>
                    <td className="px-3 py-2 text-right">{d.trips}</td>
                    <td className="px-3 py-2 text-right">{multi(d.byCurrency, 'driver')}</td>
                    <td className="px-3 py-2 text-right">{multi(d.byCurrency, 'driverPaid')}</td>
                    <td className="px-4 py-2 text-right font-semibold">{multi(d.byCurrency, 'driverDue')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Voyages confirmés ({data.trips.length})</h2>
        {data.trips.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">Aucun voyage confirmé pour {year}.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.trips.map((t) => (
              <li key={t.id} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 text-sm">
                  <p>
                    <span className="font-semibold text-gray-900">{fmtDate(t.date)}</span>
                    {t.dateIsConfirmation && <span className="ml-1 text-xs text-gray-500">(confirmé le, départ non renseigné)</span>}{' '}
                    <Link href={`/admin/demandes/${t.id}`} className="font-semibold text-blue-700 hover:underline">{t.reference}</Link>
                    {t.archived && <span className="ml-2 text-xs text-gray-400">archivé</span>}
                  </p>
                  <p className="text-gray-700">{t.client} · <span className="text-gray-500">{t.circuit}</span></p>
                  <p className="text-xs text-gray-500">Chauffeur : {t.driverName || <span className="text-orange-700">non affecté</span>}</p>
                  {t.total === null ? (
                    <p className="text-xs font-medium text-amber-700">Montant non saisi</p>
                  ) : (
                    <>
                      <p className="text-xs text-gray-600">
                        Total <strong className="text-gray-900">{money(t.total, t.currency)}</strong>
                        {t.split ? (
                          <> = location {money(t.vehicle, t.currency)} + indemnité {money(t.driverPart, t.currency)}{t.other ? <> + autres {money(t.other, t.currency)}</> : null}</>
                        ) : (
                          <span className="text-blue-800"> · non ventilé</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Acompte ({data.depositPercent} %) {money(t.deposit, t.currency)} · solde {money(t.balance, t.currency)} · reste à encaisser{' '}
                        <strong className={t.remaining ? 'text-amber-700' : 'text-green-700'}>{money(t.remaining, t.currency)}</strong>
                      </p>
                    </>
                  )}
                </div>
                {t.total !== null && (
                  <div className="flex flex-wrap items-center gap-2 lg:max-w-md lg:justify-end">
                    <PaidBadge paidAt={t.depositPaidAt} label="Acompte" />
                    <PaidBadge paidAt={t.balancePaidAt} label="Solde" />
                    <ToggleButton action={toggleBalancePaid} trip={t} year={year} done={Boolean(t.balancePaidAt)} labelOn="Solde reçu" labelOff="Annuler solde" />
                    {t.split && t.driverPart > 0 && (
                      <>
                        <PaidBadge paidAt={t.driverPaidAt} label="Indemnité" />
                        <ToggleButton action={toggleDriverPaid} trip={t} year={year} done={Boolean(t.driverPaidAt)} labelOn="Indemnité versée" labelOff="Annuler indemnité" />
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-gray-500">
        L’acompte se marque comme reçu depuis la fiche de la demande (le client est alors prévenu par e-mail). Le montant de l’acompte est calculé avec le taux actuel ({data.depositPercent} %) défini dans « Paiement et acompte ».
      </p>
    </div>
  )
}
