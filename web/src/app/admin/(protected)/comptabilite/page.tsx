import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Download } from 'lucide-react'
import { getCurrentAdmin } from '@/lib/admin-access'
import { getAccounting, getAccountingYears, type AccountingTrip, type CurrencyTotals } from '@/lib/accounting'
import { formatAmount } from '@/lib/payment-settings'
import { toggleBalancePaid } from '@/app/admin/actions'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ annee?: string }> }

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const fmtDate = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
const money = (n: number, c: string) => formatAmount(n, c)
const multi = (list: CurrencyTotals[], key: 'total' | 'collected' | 'remaining') =>
  list.length ? list.map((c) => money(c[key], c.currency)).join(' + ') : '—'

function PaidBadge({ paidAt, label }: { paidAt: Date | null; label: string }) {
  return paidAt ? (
    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800" title={`Reçu le ${fmtDate(paidAt)}`}>{label} reçu</span>
  ) : (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{label} en attente</span>
  )
}

function BalanceButton({ trip, year }: { trip: AccountingTrip; year: number }) {
  if (trip.total === null) return null
  return (
    <form action={toggleBalancePaid}>
      <input type="hidden" name="quoteId" value={trip.id} />
      <input type="hidden" name="returnTo" value={`/admin/comptabilite?annee=${year}`} />
      <button className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${trip.balancePaidAt ? 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50' : 'border-green-300 bg-green-50 text-green-800 hover:bg-green-100'}`}>
        {trip.balancePaidAt ? 'Annuler « solde reçu »' : 'Marquer le solde reçu'}
      </button>
    </form>
  )
}

export default async function AccountingPage({ searchParams }: Props) {
  const me = await getCurrentAdmin()
  if (!me || me.role !== 'SUPER_ADMIN') redirect('/admin/dashboard')

  const years = await getAccountingYears()
  const requested = Number((await searchParams).annee)
  const year = years.includes(requested) ? requested : new Date().getUTCFullYear()
  const data = await getAccounting(year)
  const cards = [
    { label: 'Chiffre d’affaires confirmé', value: multi(data.totals, 'total'), hint: `${data.trips.length} voyage(s) confirmé(s)` },
    { label: 'Encaissé', value: multi(data.totals, 'collected'), hint: 'Acomptes et soldes marqués reçus' },
    { label: 'Reste à encaisser', value: multi(data.totals, 'remaining'), hint: `Acompte : ${data.depositPercent} % du montant` },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Super-administration</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Comptabilité</h1>
          <p className="mt-1 text-sm text-gray-500">Voyages au statut « Confirmé » dont le départ a lieu dans l’année. Total = montant du devis ; acompte = {data.depositPercent} % du total ; solde = total − acompte ; encaissé = acomptes et soldes marqués reçus.</p>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="mt-1 text-xs text-gray-400">{c.hint}</p>
          </div>
        ))}
      </div>

      {data.missingAmount.length > 0 && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>{data.missingAmount.length} voyage(s) confirmé(s) sans montant</strong> : ils ne sont pas comptés. Saisissez le montant total dans la fiche :{' '}
          {data.missingAmount.map((t, i) => (
            <span key={t.id}>{i > 0 && ', '}<Link href={`/admin/demandes/${t.id}`} className="font-semibold underline">{t.reference}</Link></span>
          ))}.
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Par mois ({year})</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Mois</th>
                <th className="px-4 py-2 text-right font-medium">Voyages</th>
                <th className="px-4 py-2 text-right font-medium">Chiffre d’affaires</th>
                <th className="px-4 py-2 text-right font-medium">Encaissé</th>
                <th className="px-4 py-2 text-right font-medium">Reste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.months.map((m) => (
                <tr key={m.month} className={m.byCurrency.length ? '' : 'text-gray-400'}>
                  <td className="px-4 py-2">{MONTHS[m.month]}</td>
                  <td className="px-4 py-2 text-right">{m.byCurrency.reduce((n, c) => n + c.trips, 0) || '—'}</td>
                  <td className="px-4 py-2 text-right">{multi(m.byCurrency, 'total')}</td>
                  <td className="px-4 py-2 text-right">{multi(m.byCurrency, 'collected')}</td>
                  <td className="px-4 py-2 text-right">{multi(m.byCurrency, 'remaining')}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold text-gray-900">
                <td className="px-4 py-2">Total</td>
                <td className="px-4 py-2 text-right">{data.totals.reduce((n, c) => n + c.trips, 0)}</td>
                <td className="px-4 py-2 text-right">{multi(data.totals, 'total')}</td>
                <td className="px-4 py-2 text-right">{multi(data.totals, 'collected')}</td>
                <td className="px-4 py-2 text-right">{multi(data.totals, 'remaining')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Voyages confirmés ({data.trips.length})</h2>
        {data.trips.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">Aucun voyage confirmé pour {year}.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.trips.map((t) => (
              <li key={t.id} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 text-sm">
                  <p>
                    <span className="font-semibold text-gray-900">{fmtDate(t.date)}</span>
                    {t.dateIsConfirmation && <span className="ml-1 text-xs text-gray-500">(confirmé le, départ non renseigné)</span>}{' '}
                    <Link href={`/admin/demandes/${t.id}`} className="font-semibold text-blue-700 hover:underline">{t.reference}</Link>
                    {t.archived && <span className="ml-2 text-xs text-gray-400">archivé</span>}
                  </p>
                  <p className="text-gray-700">{t.client} · <span className="text-gray-500">{t.circuit}</span></p>
                  {t.total === null ? (
                    <p className="text-xs font-medium text-amber-700">Montant non saisi</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Total <strong className="text-gray-800">{money(t.total, t.currency)}</strong> · acompte ({data.depositPercent} %) {money(t.deposit, t.currency)} · solde {money(t.balance, t.currency)} · reste à encaisser{' '}
                      <strong className={t.remaining ? 'text-amber-700' : 'text-green-700'}>{money(t.remaining, t.currency)}</strong>
                    </p>
                  )}
                </div>
                {t.total !== null && (
                  <div className="flex flex-wrap items-center gap-2">
                    <PaidBadge paidAt={t.depositPaidAt} label="Acompte" />
                    <PaidBadge paidAt={t.balancePaidAt} label="Solde" />
                    <BalanceButton trip={t} year={year} />
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
