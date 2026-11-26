
'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type {
  PackagePricingScope,
  TravelSeason,
  RoadCondition,
} from '@/generated/prisma/enums'

async function requireSuperAdmin() {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'SUPER_ADMIN') {
    throw new Error('Accès réservé au super-administrateur.')
  }
}

function readText(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim()
}

function readPositiveInteger(value: string, label: string, max = 10000) {
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 1 || number > max) {
    throw new Error(`${label} invalide.`)
  }
  return number
}

// ======================================================
// NOUVELLE ADMINISTRATION : VÉHICULES GLOBAUX
// ======================================================

export async function saveVehicleType(formData: FormData) {
  await requireSuperAdmin()

  const id = readText(formData, 'id')
  const code = readText(formData, 'code').toLowerCase()
  const name = readText(formData, 'name')
  const capacity = readPositiveInteger(readText(formData, 'capacity'), 'Capacité', 100)
  const pricePerDayRaw = readText(formData, 'pricePerDay')
  const pricePerDay = Number(pricePerDayRaw)
  const currency = readText(formData, 'currency').toUpperCase() || 'EUR'
  const indicativeOnly = formData.get('indicativeOnly') === 'on'
  const active = formData.get('active') === 'on'

  if (
    !/^[a-z0-9-]{1,120}$/.test(code) ||
    !name ||
    name.length > 120 ||
    !Number.isSafeInteger(pricePerDay) ||
    pricePerDay < 0 ||
    !/^[A-Z]{3}$/.test(currency)
  ) {
    throw new Error('Informations du véhicule invalides.')
  }

  const data = {
    code,
    name,
    capacity,
    pricePerDay,
    currency,
    indicativeOnly,
    active,
  }

  if (id) {
    await prisma.vehicleType.update({ where: { id }, data })
  } else {
    await prisma.vehicleType.create({ data })
  }

  revalidatePath('/admin/prix')
}

export async function deactivateVehicleType(formData: FormData) {
  await requireSuperAdmin()

  const id = readText(formData, 'id')
  if (!id) throw new Error('Véhicule introuvable.')

  await prisma.vehicleType.update({
    where: { id },
    data: { active: false },
  })

  revalidatePath('/admin/prix')
}

// ======================================================
// NOUVELLE ADMINISTRATION : DURÉES DES CIRCUITS
// ======================================================

const seasons: TravelSeason[] = ['DRY', 'RAINY']
const roadConditions: RoadCondition[] = ['GOOD', 'MEDIUM', 'DIFFICULT']

export async function saveCircuitDurations(formData: FormData) {
  await requireSuperAdmin()

  const circuitSlug = readText(formData, 'circuitSlug').toLowerCase()

  if (!/^[a-z0-9-]{1,191}$/.test(circuitSlug)) {
    throw new Error('Circuit invalide.')
  }

  for (const season of seasons) {
    for (const roadCondition of roadConditions) {
      const prefix = `${season}_${roadCondition}`
      const minRaw = readText(formData, `${prefix}_min`)
      const maxRaw = readText(formData, `${prefix}_max`)

      // Deux champs vides : cette combinaison reste non configurée.
      if (!minRaw && !maxRaw) {
        await prisma.circuitDuration.deleteMany({
          where: { circuitSlug, season, roadCondition },
        })
        continue
      }

      if (!minRaw || !maxRaw) {
        throw new Error(
          `Complétez les deux durées pour ${season} / ${roadCondition}.`,
        )
      }

      const minDays = readPositiveInteger(minRaw, 'Durée minimale', 365)
      const maxDays = readPositiveInteger(maxRaw, 'Durée maximale', 365)

      if (maxDays < minDays) {
        throw new Error(
          `La durée maximale doit être supérieure ou égale à la durée minimale (${season} / ${roadCondition}).`,
        )
      }

      await prisma.circuitDuration.upsert({
        where: {
          circuitSlug_season_roadCondition: {
            circuitSlug,
            season,
            roadCondition,
          },
        },
        create: {
          circuitSlug,
          season,
          roadCondition,
          minDays,
          maxDays,
        },
        update: {
          minDays,
          maxDays,
        },
      })
    }
  }

  revalidatePath('/admin/prix')
}

// ======================================================
// RETOURS À VIDE (paramétrables)
// ======================================================

const slugifyValue = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function readList(formData: FormData, checkboxKey: string, extraKey: string, mode: 'slug' | 'phrase') {
  const values = [
    ...formData.getAll(checkboxKey).map(String),
    ...String(formData.get(extraKey) || '').split(/[,\n;]+/),
  ]
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => (mode === 'slug' ? slugifyValue(v) : v.toLowerCase().slice(0, 120)))
    .filter(Boolean)
  return [...new Set(values)].slice(0, 100)
}

function readDays(raw: string, label: string, optional = false) {
  if (!raw) {
    if (optional) return null
    throw new Error(`${label} : valeur obligatoire.`)
  }
  const n = Number(raw)
  if (!Number.isSafeInteger(n) || n < 0 || n > 60) throw new Error(`${label} invalide (0 à 60 jours).`)
  return n
}

export async function saveEmptyReturnRule(formData: FormData) {
  await requireSuperAdmin()
  const id = readText(formData, 'id')
  const label = readText(formData, 'label').slice(0, 120)
  if (!label) throw new Error('Nom de la règle obligatoire.')
  const days = readDays(readText(formData, 'days'), 'Jours de retour à vide') as number
  const ferryDays = readDays(readText(formData, 'ferryDays'), 'Jours si véhicule embarqué', true)
  const circuitSlugs = readList(formData, 'circuitSlugs', 'circuitSlugsExtra', 'slug')
  const regionValues = readList(formData, 'regionValues', 'regionValuesExtra', 'slug')
  const keywords = readList(formData, 'keywordsList', 'keywords', 'phrase')
  const sortOrderRaw = readText(formData, 'sortOrder')
  const sortOrder = sortOrderRaw ? Math.max(0, Math.min(999, Math.trunc(Number(sortOrderRaw)) || 0)) : 0
  const active = formData.get('active') === 'on'
  if (!circuitSlugs.length && !regionValues.length && !keywords.length) {
    throw new Error('Choisissez au moins un circuit, une région ou un mot-clé.')
  }
  const data = {
    label,
    days,
    ferryDays,
    circuitSlugs: circuitSlugs.join(','),
    regionValues: regionValues.join(','),
    keywords: keywords.length ? keywords.join(',') : null,
    active,
    sortOrder,
  }
  if (id) await prisma.emptyReturnRule.update({ where: { id }, data })
  else await prisma.emptyReturnRule.create({ data })
  revalidatePath('/admin/prix')
}

export async function deleteEmptyReturnRule(formData: FormData) {
  await requireSuperAdmin()
  const id = readText(formData, 'id')
  if (!id) throw new Error('Règle introuvable.')
  await prisma.emptyReturnRule.delete({ where: { id } })
  revalidatePath('/admin/prix')
}

// ======================================================
// ANCIENNES ACTIONS CONSERVÉES POUR COMPATIBILITÉ
// ======================================================

export async function savePricing(formData: FormData) {
  await requireSuperAdmin()
  const circuitSlug = readText(formData, 'circuitSlug').toLowerCase()
  const currency = readText(formData, 'currency').toUpperCase() || 'EUR'
  const tourPriceRaw = readText(formData, 'tourPrice')
  const tourPrice = tourPriceRaw ? Number(tourPriceRaw) : null
  const dailyCarEnabled = formData.get('dailyCarEnabled') === 'on'
  const tourPriceEnabled = formData.get('tourPriceEnabled') === 'on'
  const id = readText(formData, 'id')

  if (
    !/^[a-z0-9-]{1,191}$/.test(circuitSlug) ||
    !/^[A-Z]{3}$/.test(currency) ||
    (tourPrice !== null && (!Number.isSafeInteger(tourPrice) || tourPrice < 0)) ||
    (tourPriceEnabled && (!tourPrice || tourPrice <= 0))
  ) {
    throw new Error('Paramètres de tarification invalides.')
  }

  const data = { circuitSlug, currency, dailyCarEnabled, tourPriceEnabled, tourPrice }

  if (id) await prisma.pricingConfig.update({ where: { id }, data })
  else await prisma.pricingConfig.create({ data })

  revalidatePath('/admin/prix')
}

export async function deletePricing(formData: FormData) {
  await requireSuperAdmin()
  const id = readText(formData, 'id')
  if (!id) throw new Error('Circuit introuvable.')
  await prisma.pricingConfig.delete({ where: { id } })
  revalidatePath('/admin/prix')
}

export async function saveVehicle(formData: FormData) {
  await requireSuperAdmin()

  const id = readText(formData, 'id')
  const configId = readText(formData, 'configId')
  const code = readText(formData, 'code')
  const aliases = [...new Set(
    readText(formData, 'aliases')
      .split(/\r?\n/)
      .map((alias) => alias.trim())
      .filter(Boolean),
  )]
  const name = readText(formData, 'name')
  const capacity = Number(formData.get('capacity'))
  const pricePerDay = Number(formData.get('pricePerDay'))
  const indicativeOnly = formData.get('indicativeOnly') === 'on'

  if (
    !configId ||
    !code ||
    code.length > 120 ||
    !name ||
    name.length > 120 ||
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 100 ||
    !Number.isSafeInteger(pricePerDay) ||
    pricePerDay < 0
  ) {
    throw new Error('Informations du véhicule invalides.')
  }

  const data = {
    code,
    aliases: aliases.join('\n') || null,
    name,
    capacity,
    pricePerDay,
    indicativeOnly,
  }

  if (id) await prisma.pricingVehicle.update({ where: { id }, data })
  else await prisma.pricingVehicle.create({ data: { ...data, configId } })

  revalidatePath('/admin/prix')
}

export async function deleteVehicle(formData: FormData) {
  await requireSuperAdmin()
  const id = readText(formData, 'id')
  if (!id) throw new Error('Véhicule introuvable.')
  await prisma.pricingVehicle.delete({ where: { id } })
  revalidatePath('/admin/prix')
}

const packageServices = {
  car: 'Car',
  room: 'Room',
  park_entrance: 'Park entrance',
  guide: 'Guide',
  car_rent: 'Car rent',
  driver: 'Driver',
} as const

const pricingUnits = ['PER_PERSON', 'PER_DAY', 'PER_VEHICLE', 'FIXED'] as const

export async function savePricingPackage(formData: FormData) {
  await requireSuperAdmin()

  const id = readText(formData, 'id')
  const configId = readText(formData, 'configId')
  const name = readText(formData, 'name')
  const scopeValue = readText(formData, 'scope') || 'BOTH'

  if (!configId || !name || name.length > 120) {
    throw new Error('Nom de package invalide.')
  }

  if (!['DAILY_CAR', 'TOUR_INCLUDED', 'BOTH'].includes(scopeValue)) {
    throw new Error('Mode du package invalide.')
  }

  const data = { name, scope: scopeValue as PackagePricingScope }

  if (id) {
    await prisma.pricingPackage.update({
      where: { id },
      data: { ...data, active: formData.get('active') === 'on' },
    })
  } else {
    await prisma.pricingPackage.create({ data: { ...data, configId } })
  }

  revalidatePath('/admin/prix')
}

export async function savePricingPackageItems(formData: FormData) {
  await requireSuperAdmin()

  const packageId = readText(formData, 'packageId')
  const codes = formData.getAll('serviceCode').map(String)
  const names = formData.getAll('serviceName').map(String)
  const prices = formData.getAll('servicePrice').map(String)
  const units = formData.getAll('serviceUnit').map(String)

  if (
    !packageId ||
    codes.length !== names.length ||
    codes.length !== prices.length ||
    codes.length !== units.length ||
    codes.length !== Object.keys(packageServices).length
  ) {
    throw new Error('Prestations du package invalides.')
  }

  const packageExists = await prisma.pricingPackage.findUnique({
    where: { id: packageId },
    select: { id: true },
  })

  if (!packageExists) throw new Error('Package introuvable.')

  for (let index = 0; index < codes.length; index += 1) {
    const code = codes[index]
    const name = names[index].trim()
    const rawPrice = prices[index].trim()

    if (
      !Object.hasOwn(packageServices, code) ||
      !name ||
      name.length > 120 ||
      !pricingUnits.includes(units[index] as typeof pricingUnits[number])
    ) {
      throw new Error('Prestation invalide.')
    }

    if (!rawPrice) {
      await prisma.pricingPackageItem.deleteMany({ where: { packageId, code } })
      continue
    }

    const price = Number(rawPrice)
    if (!Number.isSafeInteger(price) || price < 0) {
      throw new Error('Prix de prestation invalide.')
    }

    await prisma.pricingPackageItem.upsert({
      where: { packageId_code: { packageId, code } },
      create: {
        packageId,
        code,
        name,
        price,
        unit: units[index] as typeof pricingUnits[number],
      },
      update: {
        name,
        price,
        unit: units[index] as typeof pricingUnits[number],
      },
    })
  }

  revalidatePath('/admin/prix')
}

export async function deletePricingPackage(formData: FormData) {
  await requireSuperAdmin()
  const id = readText(formData, 'id')
  if (!id) throw new Error('Package introuvable.')
  await prisma.pricingPackage.delete({ where: { id } })
  revalidatePath('/admin/prix')
}

export async function savePricingRule(formData: FormData) {
  await requireSuperAdmin()

  const kind = readText(formData, 'kind')
  const threshold = Number(formData.get('threshold'))
  const percentage = Number(formData.get('percentage'))
  const id = readText(formData, 'id')

  if (
    !['MULTIPLEX', 'FLOTTE'].includes(kind) ||
    !Number.isInteger(threshold) ||
    threshold < 2 ||
    !Number.isInteger(percentage) ||
    percentage < 1 ||
    percentage > 100
  ) {
    throw new Error('Règle de réduction invalide.')
  }

  const data = {
    kind,
    threshold,
    percentage,
    active: formData.get('active') === 'on',
  }

  if (id) await prisma.pricingRule.update({ where: { id }, data })
  else await prisma.pricingRule.create({ data })

  revalidatePath('/admin/prix')
}

export async function deletePricingRule(formData: FormData) {
  await requireSuperAdmin()
  const id = readText(formData, 'id')
  if (!id) throw new Error('Réduction introuvable.')
  await prisma.pricingRule.delete({ where: { id } })
  revalidatePath('/admin/prix')
}
