
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanityClient } from '@/lib/sanity'
import {
  deactivateVehicleType,
  saveCircuitDurations,
  saveVehicleType,
} from './actions'

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
            sont indicatives ; Vonjy déterminera la durée finale
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
    </div>
  )
}
