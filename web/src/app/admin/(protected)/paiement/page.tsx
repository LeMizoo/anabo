import { formatTimestamp } from '@/lib/datetime'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getPaymentSettings, depositAmount, formatAmount } from '@/lib/payment-settings'
import { FormSubmitButton } from '@/components/admin/FormSubmitButton'
import { savePaymentSettings } from './actions'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ ok?: string; erreur?: string }> }

const input =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-500'

export default async function PaymentSettingsPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')
  const isSuperAdmin = (session.user as { role?: string })?.role === 'SUPER_ADMIN'
  const { ok, erreur } = await searchParams
  const s = await getPaymentSettings()
  const example = depositAmount(1500, s.depositPercent)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paiement et acompte</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ces informations sont affichées au client sur sa page de devis, dans les e-mails et sur la page
          « Annulation et remboursement », dans les trois langues.
        </p>
      </div>

      {ok && <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">{ok}</p>}
      {erreur && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{erreur}</p>}

      {!s.accountHolder && (
        <p className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          Le titulaire du compte n’est pas encore renseigné : il n’apparaît pas encore dans les instructions envoyées aux clients.
        </p>
      )}

      {!isSuperAdmin && (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          Consultation seule : seul un SUPER_ADMIN peut modifier ces paramètres.
        </p>
      )}

      <form action={savePaymentSettings} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Moyen de paiement *
            <input name="method" required maxLength={80} defaultValue={s.method} disabled={!isSuperAdmin} className={input} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Numéro *
            <input name="phoneNumber" required maxLength={40} defaultValue={s.phoneNumber} disabled={!isSuperAdmin} className={input} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Titulaire du compte
            <input name="accountHolder" maxLength={150} defaultValue={s.accountHolder || ''} placeholder="Nom affiché sur le compte Mobile Money" disabled={!isSuperAdmin} className={input} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Acompte (% du total du devis) *
            <input name="depositPercent" type="number" min={0} max={100} required defaultValue={s.depositPercent} disabled={!isSuperAdmin} className={input} />
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">
            Instructions complémentaires (facultatif)
            <textarea name="instructions" rows={3} maxLength={2000} defaultValue={s.instructions || ''} placeholder="Ex. : indiquez votre référence de devis comme motif du paiement." disabled={!isSuperAdmin} className={input} />
          </label>
        </div>
        {isSuperAdmin && (
          <FormSubmitButton label="Enregistrer" pendingLabel="Enregistrement…" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60" />
        )}
      </form>

      <section className="rounded-xl border border-gray-200 bg-white p-6 text-sm shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Aperçu côté client</h2>
        <p className="text-gray-700">
          Un acompte de <strong>{s.depositPercent} %</strong> du montant total du devis est requis pour confirmer la réservation
          {example ? <> (ex. : {formatAmount(example, 'EUR')} pour un devis de {formatAmount(1500, 'EUR')})</> : null}.
          Paiement par <strong>{s.method}</strong> au <strong>{s.phoneNumber}</strong>
          {s.accountHolder ? <> — titulaire : <strong>{s.accountHolder}</strong></> : null}.
        </p>
        {s.updatedAt && (
          <p className="mt-3 text-xs text-gray-400">
            Dernière modification : {formatTimestamp(s.updatedAt, 'fr')}{s.updatedBy ? ` par ${s.updatedBy}` : ''}
          </p>
        )}
      </section>
    </div>
  )
}
