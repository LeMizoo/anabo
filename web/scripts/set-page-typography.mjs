import nextEnv from '@next/env'
import { createClient } from '@sanity/client'

nextEnv.loadEnvConfig(process.cwd())

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

function applyTypography(value, counter) {
  if (Array.isArray(value)) {
    return value.map((item) => applyTypography(item, counter))
  }
  if (!value || typeof value !== 'object') return value

  const updated = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, applyTypography(item, counter)]),
  )

  if (!styleableTypes.has(updated._type)) return updated

  let changed = false
  if (updated.titleFont !== 'font-euphoria') {
    updated.titleFont = 'font-euphoria'
    changed = true
  }
  if (!updated.titleWeight) {
    updated.titleWeight = 'font-normal'
    changed = true
  }
  if (changed) counter.blocks += 1

  return updated
}

const [pages, siteSettings] = await Promise.all([
  client.fetch('*[_type == "page"]{_id, _rev, language, "slug": slug.current, modules[]{...}}'),
  client.fetch('*[_type == "siteSettings"][0]{_id, _rev}'),
])

if (!siteSettings) {
  throw new Error('Le document Sanity "siteSettings" est introuvable.')
}

const updates = []
for (const page of pages) {
  const counter = { blocks: 0 }
  const modules = applyTypography(page.modules || [], counter)
  if (counter.blocks) updates.push({ page, modules, blocks: counter.blocks })
}

console.log(`Mode : ${isApply ? 'écriture Sanity' : 'simulation sans écriture'}`)
console.log(`Pages parcourues : ${pages.length}. Pages à mettre à jour : ${updates.length}.`)
for (const { page, blocks } of updates) {
  console.log(`- [${page.language || '—'}] /${page.slug || 'sans-slug'} : ${blocks} bloc(s)`)
}

if (!isApply) {
  console.log('\nAucun document Sanity n’a été modifié. Relancez avec --apply pour appliquer la typographie.')
} else {
  const transaction = client.transaction()
  for (const { page, modules } of updates) {
    transaction.patch(page._id, (patch) =>
      patch.ifRevisionId(page._rev).set({ modules }),
    )
  }
  transaction.patch(siteSettings._id, (patch) =>
    patch.ifRevisionId(siteSettings._rev).set({
      'typography.globalHeadingFont': 'font-euphoria',
      'typography.globalHeadingWeight': 'font-normal',
    }),
  )
  const result = await transaction.commit()
  console.log(`Mise à jour terminée : ${result.results.length} document(s) modifié(s).`)

  const [verifiedPages, verifiedSettings] = await Promise.all([
    client.fetch('*[_type == "page"]{modules[]{...}}'),
    client.fetch('*[_type == "siteSettings"][0]{typography}'),
  ])
  const remaining = verifiedPages.reduce((count, page) => {
    const counter = { blocks: 0 }
    applyTypography(page.modules || [], counter)
    return count + counter.blocks
  }, 0)
  if (
    remaining ||
    verifiedSettings?.typography?.globalHeadingFont !== 'font-euphoria' ||
    verifiedSettings?.typography?.globalHeadingWeight !== 'font-normal'
  ) {
    throw new Error('La vérification après écriture Sanity a détecté des valeurs de typographie manquantes.')
  }
  console.log(`Vérification terminée : ${verifiedPages.length} pages et la typographie globale sont à jour.`)
}
