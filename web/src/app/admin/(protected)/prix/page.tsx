
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanityClient } from '@/lib/sanity'
import {
  deactivateVehicleType,
  deleteEmptyReturnRule,
  saveCircuitDurations,
  saveEmptyReturnRule,
  saveVehicleType,
} from './actions'
import { DEFAULT_EMPTY_RETURN_RULES, splitList } from '@/lib/trip-pricing'

export const dynamic = 'force-dynamic'

const input =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100'

const button =
  'rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800'

const seasons = [
  { value: 'DRY', label: 'Saison sèche' },
  { value: 'RAINY', label: 'Saison des pluies' },
] as const

const roadConditions = [
  { value: 'GOOD', label: 'Bon' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'DIFFICULT', label: 'Difficile' },
] as const

const currencies = [
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'MGA', label: 'MGA — Ariary' },
  { value: 'USD', label: 'USD — Dollar US' },
  { value: 'GBP', label: 'GBP — Livre sterling' },
]

export default async function PricingPage() {
  const session = await auth()

  if (
    (session?.user as { role?: string } | undefined)?.role !==
    'SUPER_ADMIN'
  ) {
    redirect('/admin/dashboard')
  }

  const [vehicles, durations] = await Promise.all([
    prisma.vehicleType.findMany({
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
    }),
    prisma.circuitDuration.findMany({
      orderBy: [
        { circuitSlug: 'asc' },
        { season: 'asc' },
        { roadCondition: 'asc' },
      ],
    }),
  ])

  let catalogueAvailable = true
  let catalogue: { slug: string; title: string; language?: string }[] = []

  try {
    const pages = await sanityClient.fetch<
      { slug: string; title: string; language?: string }[]
    >(
      `*[_type == "page" && pageType in ["circuit", "custom-trip"] && defined(slug.current)]{
        "slug": slug.current,
        title,
        language
      } | order(title asc)`,
    )

    const bySlug = new Map<
      string,
      { slug: string; title: string; language?: string }
    >()

    for (const page of [...pages].sort(
      (a, b) =>
        Number(b.language === 'fr') - Number(a.language === 'fr'),
    )) {
      if (page.slug && !bySlug.has(page.slug)) {
        bySlug.set(page.slug, page)
      }
    }

    catalogue = [...bySlug.values()]
  } catch (error) {
    catalogueAvailable = false
    console.error(
      '[admin/prix] Impossible de récupérer les circuits Sanity :',
      error,
    )
  }

  const circuitMap = new Map(
    catalogue.map((circuit) => [circuit.slug, circuit]),
  )

  for (const duration of durations) {
    if (!circuitMap.has(duration.circuitSlug)) {
      circuitMap.set(duration.circuitSlug, {
        slug: duration.circuitSlug,
        title: duration.circuitSlug,
      })
    }
  }

  const circuits = [...circuitMap.values()].sort((a, b) =>
    a.title.localeCompare(b.title),
  )

  // ---------- Retours à vide ----------
  type RuleRow = { id: string; label: string; days: number; ferryDays: number | null; circuitSlugs: string; regionValues: string; keywords: string | null; active: boolean; sortOrder: number }
  let emptyReturnRules: RuleRow[] | null = null
  try {
    emptyReturnRules = await prisma.emptyReturnRule.findMany({ orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }] })
  } catch {
    emptyReturnRules = null // table absente : migration 0009 à exécuter
  }

  // Régions proposées dans le formulaire « voyage sur mesure » (valeurs par langue).
  const regionOptions = new Map<string, string[]>()
  try {
    const trips = await sanityClient.fetch<{ language?: string; regions?: { value?: string; title?: string }[] }[]>(
      `*[_type == "page" && pageType == "custom-trip" && !(_id in path("drafts.**"))]{ language, "regions": modules[_type == "customQuoteBlock"][0].regions[]{ value, title } }`,
    )
    for (const trip of trips) {
      for (const r of trip.regions || []) {
        if (!r.value) continue
        const list = regionOptions.get(r.value) || []
        list.push(`${(trip.language || '').toUpperCase()} : ${r.title || r.value}`)
        regionOptions.set(r.value, list)
      }
    }
  } catch (error) {
    console.error('[admin/prix] Régions du sur-mesure indisponibles :', error)
  }
  const circuitOptions = circuits.filter((c) => c.slug !== 'sur-mesure')

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">
          Super-administration
        </p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Véhicules et durées des circuits
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Gérez les catégories de véhicules et les durées indicatives
          des circuits selon la saison et l’état des routes.
        </p>
      </header>

      {/* SECTION 1 : VÉHICULES */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            1. Véhicules
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Les catégories sont communes à tous les circuits.
            La capacité est informative : le nombre de véhicules
            reste choisi manuellement lors du traitement du devis.
          </p>
        </div>

        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <article
              key={vehicle.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <form
                action={saveVehicleType}
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 xl:items-end"
              >
                <input
                  type="hidden"
                  name="id"
                  value={vehicle.id}
                />

                <label className="text-sm font-medium text-gray-700">
                  Code interne
                  <input
                    className={input}
                    name="code"
                    defaultValue={vehicle.code}
                    maxLength={120}
                    required
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Catégorie
                  <input
                    className={input}
                    name="name"
                    defaultValue={vehicle.name}
                    maxLength={120}
                    required
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Places
                  <input
                    className={input}
                    name="capacity"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={vehicle.capacity}
                    required
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Prix par jour
                  <input
                    className={input}
                    name="pricePerDay"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={vehicle.pricePerDay}
                    required
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Devise
                  <select
                    className={input}
                    name="currency"
                    defaultValue={vehicle.currency}
                  >
                    {currencies.map((currency) => (
                      <option
                        key={currency.value}
                        value={currency.value}
                      >
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="indicativeOnly"
                      defaultChecked={vehicle.indicativeOnly}
                    />
                    Tarif indicatif
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={vehicle.active}
                    />
                    Actif
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-6">
                  <button className={button}>
                    Enregistrer
                  </button>
                </div>
              </form>

              {!vehicle.active && (
                <p className="mt-3 text-sm text-amber-700">
                  Cette catégorie est désactivée. Cochez « Actif »
                  pour la réactiver.
                </p>
              )}

              {vehicle.active && (
                <form
                  action={deactivateVehicleType}
                  className="mt-3 border-t border-gray-100 pt-3"
                >
                  <input
                    type="hidden"
                    name="id"
                    value={vehicle.id}
                  />
                  <button
                    className="text-sm font-medium text-red-700 hover:text-red-900"
                  >
                    Désactiver cette catégorie
                  </button>
                </form>
              )}
            </article>
          ))}

          {vehicles.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500">
              Aucune catégorie de véhicule enregistrée.
            </p>
          )}
        </div>

        <div className="mt-8 rounded-xl bg-blue-50/70 p-5">
          <h3 className="font-semibold text-gray-900">
            Ajouter une catégorie de véhicule
          </h3>

          <form
            action={saveVehicleType}
            className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5 xl:items-end"
          >
            <label className="text-sm font-medium text-gray-700">
              Code interne
              <input
                className={input}
                name="code"
                placeholder="4x4"
                maxLength={120}
                required
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Catégorie
              <input
                className={input}
                name="name"
                placeholder="4x4"
                maxLength={120}
                required
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Nombre de places
              <input
                className={input}
                name="capacity"
                type="number"
                min="1"
                max="100"
                placeholder="4"
                required
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Prix par jour
              <input
                className={input}
                name="pricePerDay"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                required
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Devise
              <select
                className={input}
                name="currency"
                defaultValue="EUR"
              >
                {currencies.map((currency) => (
                  <option
                    key={currency.value}
                    value={currency.value}
                  >
                    {currency.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-center gap-4 md:col-span-2 xl:col-span-5">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="indicativeOnly"
                />
                Tarif indicatif uniquement
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked
                />
                Actif
              </label>

              <button className={button}>
                Ajouter le véhicule
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* SECTION 2 : DURÉES DES CIRCUITS */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            2. Durées des circuits
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configurez une durée minimale et maximale pour chaque
            combinaison de saison et d’état des routes. Ces durées
            sont indicatives ; nous déterminerons la durée finale
            lors du traitement du devis.
          </p>
        </div>

        {!catalogueAvailable && (
          <p className="mb-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Le catalogue Sanity est temporairement indisponible.
            Les circuits déjà configurés en base restent accessibles.
          </p>
        )}

        {circuits.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Aucun circuit trouvé dans le catalogue Sanity.
          </p>
        ) : (
          <div className="space-y-6">
            {circuits.map((circuit) => (
              <article
                key={circuit.slug}
                className="overflow-hidden rounded-xl border border-gray-200"
              >
                <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                  <h3 className="font-bold text-gray-900">
                    {circuit.title || circuit.slug}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {circuit.slug}
                  </p>
                </div>

                <form
                  action={saveCircuitDurations}
                  className="space-y-5 p-5"
                >
                  <input
                    type="hidden"
                    name="circuitSlug"
                    value={circuit.slug}
                  />

                  {seasons.map((season) => (
                    <div key={season.value}>
                      <h4 className="mb-3 font-semibold text-gray-800">
                        {season.label}
                      </h4>

                      <div className="grid gap-3 md:grid-cols-3">
                        {roadConditions.map((condition) => {
                          const duration = durations.find(
                            (item) =>
                              item.circuitSlug === circuit.slug &&
                              item.season === season.value &&
                              item.roadCondition === condition.value,
                          )

                          const prefix =
                            `${season.value}_${condition.value}`

                          return (
                            <div
                              key={condition.value}
                              className="rounded-lg border border-gray-200 p-3"
                            >
                              <h5 className="mb-3 text-sm font-semibold text-gray-700">
                                Routes : {condition.label}
                              </h5>

                              <div className="grid grid-cols-2 gap-2">
                                <label className="text-xs font-medium text-gray-600">
                                  Minimum (jours)
                                  <input
                                    className={input}
                                    name={`${prefix}_min`}
                                    type="number"
                                    min="1"
                                    max="365"
                                    defaultValue={duration?.minDays ?? ''}
                                    placeholder="Ex. 7"
                                  />
                                </label>

                                <label className="text-xs font-medium text-gray-600">
                                  Maximum (jours)
                                  <input
                                    className={input}
                                    name={`${prefix}_max`}
                                    type="number"
                                    min="1"
                                    max="365"
                                    defaultValue={duration?.maxDays ?? ''}
                                    placeholder="Ex. 8"
                                  />
                                </label>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <p className="max-w-xl text-xs text-gray-500">
                      Laisser les deux champs vides supprime la
                      configuration de cette combinaison.
                      Les autres combinaisons restent inchangées.
                    </p>

                    <button className={button}>
                      Enregistrer les durées
                    </button>
                  </div>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3 : RETOURS À VIDE */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" id="retours-a-vide">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">3. Retours à vide</h2>
          <p className="mt-1 text-sm text-gray-500">
            Quand un voyage se termine hors d’Antananarivo, le client prend en charge les jours de retour du véhicule et du
            chauffeur (location + indemnité chauffeur). Une règle s’applique au circuit choisi, aux régions cochées dans le
            voyage sur mesure ou, à défaut, aux mots-clés reconnus. Si plusieurs règles correspondent, la plus longue
            s’applique.
          </p>
        </div>

        {emptyReturnRules === null ? (
          <div className="space-y-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            <p>
              <strong>Migration à exécuter :</strong> la table des retours à vide n’existe pas encore. Exécutez{' '}
              <code>prisma/deploy/0009_empty_return_rules_phpmyadmin.sql</code> dans phpMyAdmin. En attendant, le site
              applique les règles par défaut ci-dessous.
            </p>
            <ul className="list-disc pl-5">
              {DEFAULT_EMPTY_RETURN_RULES.map((r) => (
                <li key={r.id}>
                  {r.label} : {r.days} j{r.ferryDays !== null ? ` (véhicule embarqué : ${r.ferryDays} j)` : ''} —{' '}
                  {r.circuitSlugs.join(', ')} · régions : {r.regionValues.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-5">
            {[...emptyReturnRules, null].map((rule) => {
              const ruleCircuits = splitList(rule?.circuitSlugs)
              const ruleRegions = splitList(rule?.regionValues)
              const extraCircuits = ruleCircuits.filter((c) => !circuitOptions.some((o) => o.slug === c))
              const extraRegions = ruleRegions.filter((r) => !regionOptions.has(r))
              return (
                <article
                  key={rule?.id || 'new'}
                  className={`rounded-xl border p-5 ${rule ? (rule.active ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-80') : 'border-dashed border-blue-300 bg-blue-50/40'}`}
                >
                  <form action={saveEmptyReturnRule} className="space-y-4">
                    {rule && <input type="hidden" name="id" value={rule.id} />}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">{rule ? rule.label : 'Ajouter une règle'}</h3>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" name="active" defaultChecked={rule ? rule.active : true} className="h-4 w-4" /> Active
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-4">
                      <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                        Nom (fin du voyage)
                        <input name="label" required maxLength={120} defaultValue={rule?.label || ''} placeholder="Ex. Sud – RN7 (Tuléar)" className={input} />
                      </label>
                      <label className="text-sm font-medium text-gray-700">
                        Jours de retour à vide
                        <input name="days" type="number" min={0} max={60} required defaultValue={rule?.days ?? ''} className={input} />
                      </label>
                      <label className="text-sm font-medium text-gray-700">
                        Jours si véhicule embarqué
                        <input name="ferryDays" type="number" min={0} max={60} defaultValue={rule?.ferryDays ?? ''} placeholder="Vide = non proposé" className={input} />
                      </label>
                    </div>

                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700">Circuits concernés</legend>
                      <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                        {circuitOptions.map((c) => (
                          <label key={c.slug} className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" name="circuitSlugs" value={c.slug} defaultChecked={ruleCircuits.includes(c.slug)} className="h-4 w-4" />
                            <span>{c.title}</span>
                          </label>
                        ))}
                      </div>
                      <input name="circuitSlugsExtra" defaultValue={extraCircuits.join(', ')} placeholder="Autres identifiants de circuit (séparés par des virgules)" className={input} />
                    </fieldset>

                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700">Régions du voyage sur mesure</legend>
                      <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                        {[...regionOptions.entries()].map(([value, labels]) => (
                          <label key={value} className="inline-flex items-start gap-2 text-sm text-gray-700" title={labels.join(' · ')}>
                            <input type="checkbox" name="regionValues" value={value} defaultChecked={ruleRegions.includes(value)} className="mt-0.5 h-4 w-4" />
                            <span>
                              <code className="text-xs">{value}</code> <span className="text-xs text-gray-500">{labels.join(' · ')}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                      <input name="regionValuesExtra" defaultValue={extraRegions.join(', ')} placeholder="Autres valeurs reconnues (séparées par des virgules)" className={input} />
                    </fieldset>

                    <div className="grid gap-4 sm:grid-cols-4">
                      <label className="text-sm font-medium text-gray-700 sm:col-span-3">
                        Mots-clés de secours (titre ou destination, séparés par des virgules)
                        <input name="keywords" defaultValue={rule?.keywords || ''} className={input} />
                      </label>
                      <label className="text-sm font-medium text-gray-700">
                        Ordre d’affichage
                        <input name="sortOrder" type="number" min={0} max={999} defaultValue={rule?.sortOrder ?? ''} className={input} />
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
                      <button className={button}>{rule ? 'Enregistrer la règle' : 'Ajouter la règle'}</button>
                    </div>
                  </form>
                  {rule && (
                    <form action={deleteEmptyReturnRule} className="mt-2 text-right">
                      <input type="hidden" name="id" value={rule.id} />
                      <button className="text-xs font-medium text-red-700 hover:underline">Supprimer cette règle</button>
                    </form>
                  )}
                </article>
              )
            })}
            <p className="text-xs text-gray-500">
              Pensez à mettre à jour la FAQ (« Que sont les jours de retour à vide ? ») dans Sanity si vous modifiez ces règles.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
