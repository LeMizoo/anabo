import nextEnv from '@next/env'
import { createClient } from '@sanity/client'

nextEnv.loadEnvConfig(process.cwd())

const titleStyle = {
  titleFont: 'font-script',
  titleColor: 'gold',
  titleSize: 'h2',
}
const subtitleStyle = {
  subtitleFont: 'font-sans',
  subtitleColor: 'navy',
  subtitleSize: 'h3',
}
const homeHeroText = {
  fr: {
    title: 'Créez le Road Trip de vos rêves à Madagascar',
    subtitle: 'Location de voiture avec chauffeur-guide à Madagascar',
  },
  en: {
    title: 'Create your dream road trip in Madagascar',
    subtitle: 'Car rental with a driver-guide in Madagascar',
  },
  it: {
    title: 'Create il viaggio on the road dei vostri sogni in Madagascar',
    subtitle: 'Noleggio auto con autista-guida in Madagascar',
  },
}
const styleableTypes = new Set([
  'alternatingBlock',
  'commitmentsBlock',
  'contactFormBlock',
  'ctaBlock',
  'faqBlock',
  'featuresBlock',
  'galleryBlock',
  'headingBlock',
  'heroBlock',
  'puzzleGalleryBlock',
  'slide',
  'slider3dBlock',
  'testimonialBlock',
  'textMediaBlock',
  'tripadvisorBlock',
])
const subtitleTypes = new Set([
  'alternatingBlock',
  'commitmentsBlock',
  'headingBlock',
  'heroBlock',
  'slide',
])

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN
const isApply = process.argv.includes('--apply')

if (!projectId || !dataset) {
  throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID et NEXT_PUBLIC_SANITY_DATASET doivent être configurés.')
}
if (isApply && !token) {
  throw new Error('SANITY_API_WRITE_TOKEN est requis pour écrire dans Sanity.')
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-06',
  useCdn: false,
  ...(isApply ? { token } : {}),
})

function applyStyles(value, counter, homeLocale) {
  if (Array.isArray(value)) {
    return value.map((item) => applyStyles(item, counter, homeLocale))
  }
  if (!value || typeof value !== 'object') return value

  const updated = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, applyStyles(item, counter, homeLocale)]),
  )

  if (styleableTypes.has(updated._type)) {
    let changed = false
    const headingStyle = {
      ...titleStyle,
      titleSize: homeLocale && updated._type === 'heroBlock' ? 'h1' : 'h2',
    }
    for (const [key, style] of Object.entries(headingStyle)) {
      if (updated[key] !== style) {
        updated[key] = style
        changed = true
      }
    }

    if (homeLocale && updated._type === 'heroBlock') {
      const currentHomeHero = homeHeroText[homeLocale]
      if (
        currentHomeHero &&
        updated.title === currentHomeHero.title &&
        updated.subtitle === currentHomeHero.subtitle
      ) {
        const title = updated.title
        updated.title = updated.subtitle
        updated.subtitle = title
        changed = true
        counter.homeHeroSwaps += 1
      }
    }

    if (
      subtitleTypes.has(updated._type) &&
      Object.prototype.hasOwnProperty.call(updated, 'subtitle')
    ) {
      for (const [key, style] of Object.entries(subtitleStyle)) {
        if (updated[key] !== style) {
          updated[key] = style
          changed = true
        }
      }
    }

    if (changed) counter.blocks += 1
  }

  return updated
}

const pages = await client.fetch(
  '*[_type == "page"]{_id, _rev, language, "slug": slug.current, modules[]{...}}',
)
const updates = []

for (const page of pages) {
  const counter = { blocks: 0, homeHeroSwaps: 0 }
  const modules = applyStyles(page.modules || [], counter, page.slug === 'home' ? page.language : undefined)
  if (counter.blocks) updates.push({ page, modules, blocks: counter.blocks })
  if (counter.homeHeroSwaps) {
    console.log(`- Correction titre/sous-titre accueil [${page.language}]`)
  }
}

console.log(`Mode : ${isApply ? 'écriture Sanity' : 'simulation sans écriture'}`)
console.log(`Pages parcourues : ${pages.length}. Pages à mettre à jour : ${updates.length}.`)
for (const { page, blocks } of updates) {
  console.log(`- [${page.language || '—'}] /${page.slug || 'sans-slug'} : ${blocks} bloc(s)`)
}

if (!isApply) {
  console.log('\nAucun document Sanity n’a été modifié. Relancez avec --apply pour appliquer les styles.')
} else if (updates.length) {
  const transaction = client.transaction()
  for (const { page, modules } of updates) {
    transaction.patch(page._id, (patch) =>
      patch.ifRevisionId(page._rev).set({ modules }),
    )
  }
  const result = await transaction.commit()
  console.log(`Mise à jour terminée : ${result.results.length} page(s) modifiée(s).`)
} else {
  console.log('Toutes les pages possèdent déjà ces styles.')
}
