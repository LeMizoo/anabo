import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanityClient } from '@/lib/sanity'
import { deletePricing, deletePricingPackage, deletePricingRule, deleteVehicle, savePricing, savePricingPackage, savePricingPackageItems, savePricingRule, saveVehicle } from './actions'

export const dynamic = 'force-dynamic'

const input = 'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100'
const button = 'rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800'
const danger = 'rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50'

export default async function PricingPage() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'SUPER_ADMIN') redirect('/admin/dashboard')
  const [configs, rules] = await Promise.all([
    prisma.pricingConfig.findMany({ include: { vehicles: { orderBy: { name: 'asc' } }, packages: { include: { items: { orderBy: { code: 'asc' } } }, orderBy: { name: 'asc' } } }, orderBy: { circuitSlug: 'asc' } }),
    prisma.pricingRule.findMany({ orderBy: [{ kind: 'asc' }, { threshold: 'asc' }] }),
  ])
  let catalogueAvailable = true
  let catalogue: { slug: string; title: string; language?: string }[] = []
  try {
    const pages = await sanityClient.fetch<{ slug: string; title: string; language?: string }[]>(`*[_type == "page" && pageType in ["circuit", "custom-trip"] && defined(slug.current)]{ "slug": slug.current, title, language } | order(title asc)`)
    const bySlug = new Map<string, { slug: string; title: string; language?: string }>()
    for (const page of [...pages].sort((a, b) => Number(b.language === 'fr') - Number(a.language === 'fr'))) {
      if (page.slug && !bySlug.has(page.slug)) bySlug.set(page.slug, page)
    }
    catalogue = [...bySlug.values()]
  } catch (error) {
    catalogueAvailable = false
    console.error('[admin/prix] Impossible de récupérer les circuits Sanity :', error)
  }
  const configuredSlugs = new Set(configs.map((config) => config.circuitSlug))
  const circuitsWithoutPricing = catalogue.filter((circuit) => !configuredSlugs.has(circuit.slug))

  return <div className="mx-auto max-w-6xl space-y-8">
    <header>
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Super-administration</p>
      <h1 className="mt-1 text-3xl font-bold text-gray-900">Tarifs des circuits et véhicules</h1>
      <p className="mt-2 max-w-3xl text-gray-600">Tous les circuits existants sont importés automatiquement depuis le catalogue. Gérez ici leurs tarifs privés, stockés dans la base de données et jamais publiés dans Sanity.</p>
    </header>

    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5"><h2 className="text-xl font-bold text-gray-900">Circuits du catalogue</h2><p className="mt-1 text-sm text-gray-500">La liste est synchronisée avec les circuits publiés dans Sanity. Configurez les tarifs d’un circuit existant ici ; seuls les nouveaux circuits doivent d’abord être créés dans le catalogue.</p></div>
      {!catalogueAvailable && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Le catalogue Sanity est temporairement indisponible. Les tarifs déjà enregistrés restent accessibles ci-dessous.</p>}
      {circuitsWithoutPricing.length > 0 && <div className="mb-6 space-y-3">
        <h3 className="font-semibold text-gray-900">Circuits existants à configurer ({circuitsWithoutPricing.length})</h3>
        {circuitsWithoutPricing.map((circuit) => <form key={circuit.slug} action={savePricing} className="grid gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 md:grid-cols-2 xl:grid-cols-6 md:items-end">
          <input type="hidden" name="circuitSlug" value={circuit.slug} />
          <div><p className="font-semibold text-gray-900">{circuit.title || circuit.slug}</p><p className="text-xs text-gray-500">{circuit.slug}</p></div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700"><input type="checkbox" name="dailyCarEnabled" /> Daily price car</label>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700"><input type="checkbox" name="tourPriceEnabled" /> Tour price (véhicule inclus)</label>
          <label className="text-sm font-medium text-gray-700">Prix global du circuit<input className={input} name="tourPrice" type="number" min="0" step="1" placeholder="0" /></label>
          <label className="text-sm font-medium text-gray-700">Devise<select className={input} name="currency" defaultValue="EUR"><option value="EUR">EUR — Euro</option><option value="MGA">MGA — Ariary</option><option value="USD">USD — Dollar US</option><option value="GBP">GBP — Livre sterling</option></select></label>
          <button className={button}>Configurer le tarif</button>
        </form>)}
      </div>}

      <div className="mt-6 space-y-6">
        {configs.map((config) => <article key={config.id} className="overflow-hidden rounded-xl border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4"><div><h3 className="font-bold text-gray-900">{catalogue.find((circuit) => circuit.slug === config.circuitSlug)?.title || config.circuitSlug}</h3><p className="text-sm text-gray-500">{config.circuitSlug} · {config.vehicles.length} véhicule{config.vehicles.length === 1 ? '' : 's'} enregistré{config.vehicles.length === 1 ? '' : 's'}</p></div>
            <form action={deletePricing}><input type="hidden" name="id" value={config.id} /><button className={danger}>Supprimer ce circuit</button></form>
          </div>
          <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
            {(!config.dailyCarEnabled && !config.tourPriceEnabled) && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 lg:col-span-2">Aucun mode de tarification n’est activé : aucun devis indicatif ne sera calculé. {config.basePrice > 0 ? `L’ancien tarif par personne (${config.basePrice} ${config.currency}) est conservé mais n’est pas utilisé comme remplacement.` : ''} Activez un ou deux modes et saisissez leurs tarifs.</p>}
            {(config.dailyCarEnabled && !config.vehicles.some((vehicle) => vehicle.pricePerDay > 0)) && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 lg:col-span-2">Le mode Daily price car est activé mais aucun véhicule avec un tarif journalier positif n’est configuré : aucune estimation de ce mode ne sera produite.</p>}
            {(config.tourPriceEnabled && (!config.tourPrice || config.tourPrice <= 0)) && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 lg:col-span-2">Tour price est activé sans tarif global valide. Aucune estimation de ce mode ne sera produite.</p>}
            <div>
              <h4 className="mb-3 font-semibold text-gray-800">Paramètres du circuit</h4>
              <form action={savePricing} className="grid gap-3 sm:grid-cols-3">
                <input type="hidden" name="id" value={config.id} />
                <label className="text-sm text-gray-600">Slug<input className={input} name="circuitSlug" value={config.circuitSlug} readOnly /></label>
                <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="dailyCarEnabled" defaultChecked={config.dailyCarEnabled} /> Daily price car</label>
                <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="tourPriceEnabled" defaultChecked={config.tourPriceEnabled} /> Tour price (véhicule inclus)</label>
                <label className="text-sm text-gray-600">Prix global du circuit ({config.currency})<input className={input} name="tourPrice" type="number" min="0" step="1" defaultValue={config.tourPrice ?? ''} placeholder="Laisser vide si non configuré" /></label>
                <label className="text-sm text-gray-600">Devise<select className={input} name="currency" defaultValue={config.currency}><option value="EUR">EUR — Euro</option><option value="MGA">MGA — Ariary</option><option value="USD">USD — Dollar US</option><option value="GBP">GBP — Livre sterling</option></select></label>
                <div className="sm:col-span-3"><button className={button}>Enregistrer le circuit</button></div>
              </form>

              <h4 className="mb-3 mt-7 font-semibold text-gray-800">Véhicules existants</h4>
              {config.vehicles.length === 0 ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Aucun véhicule pour ce circuit. Ajoutez-en depuis le formulaire à droite.</p> : <div className="space-y-3">
                {config.vehicles.map((vehicle) => <form key={vehicle.id} action={saveVehicle} className="grid gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-2 xl:grid-cols-6">
                  <input type="hidden" name="id" value={vehicle.id} /><input type="hidden" name="configId" value={config.id} />
                  <label className="text-xs font-medium text-gray-600">Clé tarifaire interne<input className={input} name="code" defaultValue={vehicle.code} maxLength={120} required /></label>
                  <label className="text-xs font-medium text-gray-600">Nom affiché<input className={input} name="name" defaultValue={vehicle.name} required /></label>
                  <label className="text-xs font-medium text-gray-600">Capacité (personnes)<input className={input} name="capacity" type="number" min="1" max="100" defaultValue={vehicle.capacity} required /></label>
                  <label className="text-xs font-medium text-gray-600">Location / jour ({config.currency})<input className={input} name="pricePerDay" type="number" min="0" step="1" defaultValue={vehicle.pricePerDay} required /></label>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700"><input type="checkbox" name="indicativeOnly" defaultChecked={vehicle.indicativeOnly} /> Tarif indicatif</label>
                  <label className="text-xs font-medium text-gray-600 xl:col-span-3">Valeurs techniques des autres langues (une par ligne)<textarea className={`${input} min-h-16`} name="aliases" defaultValue={vehicle.aliases || ''} placeholder={'prado-en\nprado-it'} /></label>
                  <div className="flex items-end gap-2 xl:col-span-3"><button className={`${button} flex-1`}>Enregistrer</button><button className={danger} formAction={deleteVehicle} name="id" value={vehicle.id}>Supprimer</button></div>
                </form>)}
              </div>}
            </div>

            <aside className="rounded-xl bg-blue-50/70 p-4">
              <h4 className="font-semibold text-gray-900">Ajouter un véhicule</h4>
              <p className="mb-4 mt-1 text-sm text-gray-600">Le véhicule sera disponible pour ce circuit dans les calculs de prix.</p>
              <form action={saveVehicle} className="space-y-3">
                <input type="hidden" name="configId" value={config.id} />
                <label className="block text-sm font-medium text-gray-700">Clé tarifaire interne<input className={input} name="code" placeholder="prado" maxLength={120} required /><span className="mt-1 block text-xs text-gray-500">Identifiant stable utilisé pour cette option dans le calcul des prix.</span></label>
                <label className="block text-sm font-medium text-gray-700">Nom affiché<input className={input} name="name" placeholder="Toyota Prado" required /></label>
                <label className="block text-sm font-medium text-gray-700">Valeurs techniques des autres langues<textarea className={`${input} min-h-20`} name="aliases" placeholder={'prado-en\nprado-it'} /><span className="mt-1 block text-xs text-gray-500">Ajoutez les valeurs Sanity exactes de chaque langue, une par ligne. Le calculateur associera chaque traduction au même tarif.</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm font-medium text-gray-700">Capacité<input className={input} name="capacity" type="number" min="1" max="100" placeholder="4" required /></label>
                  <label className="text-sm font-medium text-gray-700">Prix de location / jour<input className={input} name="pricePerDay" type="number" min="0" step="1" placeholder="0" required /></label>
                </div>
                <label className="flex items-start gap-2 text-sm text-gray-700"><input className="mt-1" type="checkbox" name="indicativeOnly" /><span><strong>Tarif indicatif uniquement</strong><span className="block text-xs text-gray-500">Affiche la mention de disponibilité et de saison dans le formulaire.</span></span></label>
                <button className={button}>Ajouter ce véhicule</button>
              </form>
            </aside>
          </div>
          <section className="border-t border-gray-200 p-5">
            <h4 className="font-semibold text-gray-800">Packages personnalisés de ce circuit</h4>
            <p className="mt-1 text-sm text-gray-500">Les prix restent privés. Les unités permettent de calculer chaque prestation selon le groupe et la durée.</p>
            <form action={savePricingPackage} className="mt-4 flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-3">
              <input type="hidden" name="configId" value={config.id} />
              <label className="min-w-56 flex-1 text-sm font-medium text-gray-700">Nom du package<input className={input} name="name" placeholder="Essentiel, Confort…" maxLength={120} required /></label>
              <label className="text-sm font-medium text-gray-700">Associé à<select className={input} name="scope" defaultValue="BOTH"><option value="DAILY_CAR">Daily price car</option><option value="TOUR_INCLUDED">Tour price</option><option value="BOTH">Les deux modes</option></select></label>
              <button className={button}>Ajouter un package</button>
            </form>
            <div className="mt-4 space-y-4">
              {config.packages.map((pricingPackage) => <article key={pricingPackage.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <form action={savePricingPackage} className="flex flex-1 flex-wrap items-end gap-3">
                    <input type="hidden" name="id" value={pricingPackage.id} /><input type="hidden" name="configId" value={config.id} />
                    <label className="min-w-56 flex-1 text-sm font-medium text-gray-700">Package<input className={input} name="name" defaultValue={pricingPackage.name} maxLength={120} required /></label>
                    <label className="text-sm font-medium text-gray-700">Associé à<select className={input} name="scope" defaultValue={pricingPackage.scope}><option value="DAILY_CAR">Daily price car</option><option value="TOUR_INCLUDED">Tour price</option><option value="BOTH">Les deux modes</option></select></label>
                    <label className="flex items-center gap-2 pb-2 text-sm text-gray-700"><input type="checkbox" name="active" defaultChecked={pricingPackage.active} /> Disponible</label>
                    <button className={button}>Enregistrer</button>
                  </form>
                  <form action={deletePricingPackage}><input type="hidden" name="id" value={pricingPackage.id} /><button className={danger}>Supprimer</button></form>
                </div>
                <form action={savePricingPackageItems} className="mt-4">
                  <input type="hidden" name="packageId" value={pricingPackage.id} />
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {([
                      ['car', 'Car'], ['room', 'Room'], ['park_entrance', 'Park entrance'], ['guide', 'Guide'], ['car_rent', 'Car rent'], ['driver', 'Driver'],
                    ] as const).map(([code, label]) => {
                      const item = pricingPackage.items.find((entry) => entry.code === code)
                      return <div key={code} className="grid grid-cols-[minmax(0,1fr)_100px] gap-2 rounded-lg bg-slate-50 p-3">
                        <input type="hidden" name="serviceCode" value={code} /><input type="hidden" name="serviceName" value={label} />
                        <label className="text-xs font-medium text-gray-600">{label} · {config.currency}<input className={input} name="servicePrice" type="number" min="0" step="1" defaultValue={item?.price ?? ''} placeholder="Vide = absent" /></label>
                        <label className="text-xs font-medium text-gray-600">Unité<select className={input} name="serviceUnit" defaultValue={item?.unit || 'FIXED'}><option value="FIXED">Forfait</option><option value="PER_PERSON">/ personne</option><option value="PER_DAY">/ jour</option><option value="PER_VEHICLE">/ véhicule</option></select></label>
                      </div>
                    })}
                  </div>
                  <button className={`${button} mt-3`}>Enregistrer les prestations</button>
                </form>
              </article>)}
              {config.packages.length === 0 && <p className="text-sm text-gray-500">Aucun package. Ils sont facultatifs.</p>}
            </div>
          </section>
        </article>)}
        {configs.length === 0 && circuitsWithoutPricing.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">Aucun circuit publié dans le catalogue pour le moment.</p>}
      </div>
    </section>

    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5"><h2 className="text-xl font-bold text-gray-900">Réductions automatiques</h2><p className="mt-1 text-sm text-gray-500">Les réductions actives sont appliquées par le calculateur aux seuils configurés.</p></div>
      <form action={savePricingRule} className="grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-4">
        <div className="md:col-span-4"><h3 className="font-semibold text-gray-900">Ajouter une règle</h3></div>
        <label className="text-sm font-medium text-gray-700">Type<select className={input} name="kind"><option value="MULTIPLEX">Multiplex (circuits consécutifs)</option><option value="FLOTTE">Flotte (véhicules)</option></select></label>
        <label className="text-sm font-medium text-gray-700">Nombre minimum<input className={input} name="threshold" type="number" min="2" defaultValue="2" required /></label>
        <label className="text-sm font-medium text-gray-700">Réduction (%)<input className={input} name="percentage" type="number" min="1" max="100" placeholder="10" required /></label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700"><input type="checkbox" name="active" defaultChecked /> Active</label>
        <div className="md:col-span-4"><button className={button}>Ajouter la réduction</button></div>
      </form>
      <div className="mt-5 space-y-3">
        {rules.map((rule) => <form key={rule.id} action={savePricingRule} className="grid gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto_auto] sm:items-end">
          <input type="hidden" name="id" value={rule.id} />
          <label className="text-xs font-medium text-gray-600">Type<select className={input} name="kind" defaultValue={rule.kind}><option value="MULTIPLEX">Multiplex</option><option value="FLOTTE">Flotte</option></select></label>
          <label className="text-xs font-medium text-gray-600">Seuil<input className={input} name="threshold" type="number" min="2" defaultValue={rule.threshold} required /></label>
          <label className="text-xs font-medium text-gray-600">Réduction (%)<input className={input} name="percentage" type="number" min="1" max="100" defaultValue={rule.percentage} required /></label>
          <label className="flex items-center gap-2 pb-2 text-sm text-gray-700"><input type="checkbox" name="active" defaultChecked={rule.active} /> Active</label>
          <div className="flex gap-2"><button className={button}>Enregistrer</button><button className={danger} formAction={deletePricingRule} name="id" value={rule.id}>Supprimer</button></div>
        </form>)}
        {rules.length === 0 && <p className="text-sm text-gray-500">Aucune règle enregistrée.</p>}
      </div>
    </section>
  </div>
}
