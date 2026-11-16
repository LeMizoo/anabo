import nextEnv from '@next/env'
import { createClient } from '@sanity/client'
import { createHash } from 'node:crypto'

nextEnv.loadEnvConfig(process.cwd())

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN
const apply = process.argv.includes('--apply')

if (!projectId || !dataset || !token) {
  throw new Error('Sanity project, dataset et SANITY_API_WRITE_TOKEN doivent être configurés.')
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-06',
  useCdn: false,
  token,
})

const pages = await client.fetch(`
  *[_type == "page" && !(_id in path("drafts.**"))]{
    _id, _rev, title, language, pageType, translationGroup,
    "slug": slug.current,
    featuredImage,
    modules[]{...}
  }
`)

const assetRefs = new Set()
const candidatesByGroup = new Map()
const allCandidates = new Map()

function isRenderableImage(image) {
  if (!image) return false
  if (typeof image === 'string') return /^https?:\/\//i.test(image)
  if (image.asset?._ref?.startsWith('image-')) {
    assetRefs.add(image.asset._ref)
    return true
  }
  if (image.asset?._id?.startsWith('image-')) {
    assetRefs.add(image.asset._id)
    return true
  }
  return typeof image.asset?.url === 'string' && /^https?:\/\//i.test(image.asset.url)
}

function addCandidate(group, image) {
  const ref = image?.asset?._ref || image?.asset?._id
  if (!ref?.startsWith('image-')) return
  assetRefs.add(ref)

  const candidate = allCandidates.get(ref) || {
    ref,
    text: new Set(),
    groups: new Set(),
  }
  for (const value of [image.alt, image.caption]) {
    if (typeof value === 'string' && value.trim()) candidate.text.add(value.trim())
  }
  if (group) candidate.groups.add(group)
  allCandidates.set(ref, candidate)

  if (group) {
    const groupCandidates = candidatesByGroup.get(group) || new Set()
    groupCandidates.add(ref)
    candidatesByGroup.set(group, groupCandidates)
  }
}

function collectImageCandidates(value, group) {
  if (Array.isArray(value)) {
    for (const item of value) collectImageCandidates(item, group)
    return
  }
  if (!value || typeof value !== 'object') return

  if (value.asset?._ref || value.asset?._id) addCandidate(group, value)
  for (const [key, child] of Object.entries(value)) {
    if (key !== 'asset' && child && typeof child === 'object') {
      collectImageCandidates(child, group)
    }
  }
}

for (const page of pages) {
  collectImageCandidates(page.featuredImage, page.translationGroup)
  collectImageCandidates(page.modules || [], page.translationGroup)
}

const refs = [...assetRefs]
const assetDocs = await client.fetch(
  '*[_type == "sanity.imageAsset" && _id in $refs]{_id, originalFilename, metadata{dimensions{width,height}}}',
  { refs },
)
const assetMeta = new Map(assetDocs.map((asset) => [asset._id, asset]))

for (const candidate of allCandidates.values()) {
  const asset = assetMeta.get(candidate.ref)
  if (asset?.originalFilename) candidate.text.add(asset.originalFilename)
  candidate.width = asset?.metadata?.dimensions?.width || 0
}

const stopWords = new Set(`
  a an and are as at be by for from has have in into is it its of on or the to with
  au aux chez dans de des du elle en et il la le les leur lui ma me mon nos notre
  ou par pas pour que qui sa se son sur un une vos votre vous nous
  il viaggio con del della delle gli i la le lo per un una da nel nella e o
  anabo madagascar madagascan tour travel trip journey experience roadtrip service
  driver guide car rental private local hire tourdays day step itinerary route
`.trim().split(/\s+/u))

const aliases = new Map([
  ['lemurs', 'lemur'], ['lemure', 'lemur'], ['lemuri', 'lemur'], ['lemurien', 'lemur'], ['lemuriens', 'lemur'],
  ['baobabs', 'baobab'], ['forests', 'forest'], ['foret', 'forest'], ['forests', 'forest'], ['foresta', 'forest'],
  ['beaches', 'beach'], ['plage', 'beach'], ['plages', 'beach'], ['spiaggia', 'beach'], ['spiagge', 'beach'],
  ['waterfalls', 'waterfall'], ['cascade', 'waterfall'], ['cascata', 'waterfall'],
  ['birding', 'bird'], ['birds', 'bird'], ['oiseau', 'bird'], ['oiseaux', 'bird'], ['uccelli', 'bird'],
  ['wildlife', 'wildlife'], ['faune', 'wildlife'], ['fauna', 'wildlife'],
  ['east', 'east'], ['eastern', 'east'], ['est', 'east'], ['orientale', 'east'], ['oriental', 'east'],
  ['west', 'west'], ['western', 'west'], ['ouest', 'west'], ['occidentale', 'west'],
  ['north', 'north'], ['northern', 'north'], ['nord', 'north'],
  ['south', 'south'], ['southern', 'south'], ['sud', 'south'],
  ['train', 'train'], ['railway', 'train'], ['treno', 'train'], ['ferroviaire', 'train'],
])

function tokens(value) {
  const normalized = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
  const result = new Set()
  for (let word of normalized.match(/[a-z0-9]+/gu) || []) {
    if (word.length < 3 || /^\d+$/u.test(word)) continue
    word = aliases.get(word) || word
    if (!stopWords.has(word)) result.add(word)
  }
  return result
}

function collectModuleText(value, result = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectModuleText(item, result)
    return result
  }
  if (!value || typeof value !== 'object') return result
  if (typeof value.text === 'string') result.push(value.text)
  for (const [key, child] of Object.entries(value)) {
    if (key !== 'asset' && child && typeof child === 'object') collectModuleText(child, result)
  }
  return result
}

function moduleContext(page, module) {
  return [
    page.title,
    page.slug,
    module.title,
    module.subtitle,
    ...collectModuleText(module.content),
    module.description,
  ].filter((value) => typeof value === 'string' && value.trim()).join(' ')
}

function currentImageAt(module, path) {
  let value = module
  for (const part of path) value = value?.[part]
  return value
}

function slotDescriptors(page, module) {
  if (!module || module.settings?.hidden) return []
  const slots = []
  const add = (field, path, context = moduleContext(page, module)) => {
    const image = currentImageAt(module, path)
    if (isRenderableImage(image)) return
    slots.push({ page, module, field, path, context })
  }

  if (module._type === 'heroBlock') {
    add('image', ['backgroundImage'], `${page.title} ${module.title || ''} ${module.subtitle || ''}`)
  } else if (module._type === 'textMediaBlock') {
    add('image', ['image'])
  } else if (module._type === 'alternatingBlock') {
    if (Array.isArray(module.images) && module.images.length) {
      module.images.forEach((_, index) => add('image', ['images', index]))
    } else {
      add('image', ['image'])
    }
    for (let index = 0; index < (module.floatingImages || []).length; index += 1) {
      add('floatingImage', ['floatingImages', index, 'image'])
    }
  } else if (module._type === 'imageBlock') {
    add('image', ['image'])
  } else if (module._type === 'puzzleGalleryBlock') {
    const items = Array.isArray(module.items) && module.items.length
      ? module.items
      : [null, null, null, null, null, null]
    items.forEach((_, index) => add('puzzleImage', ['items', index, 'image']))
  } else if (module._type === 'galleryBlock') {
    const images = Array.isArray(module.images) && module.images.length
      ? module.images
      : [null, null, null, null, null, null]
    images.forEach((_, index) => add('galleryImage', ['images', index]))
  } else if (module._type === 'cardsBlock') {
    for (let index = 0; index < (module.cards || []).length; index += 1) {
      add('cardImage', ['cards', index, 'image'])
    }
  } else if (module._type === 'slider3dBlock') {
    for (let index = 0; index < (module.slides || []).length; index += 1) {
      add('slideImage', ['slides', index, 'image'])
    }
  }
  return slots
}

const groups = new Map()
for (const page of pages) {
  const group = page.translationGroup || page._id
  const values = groups.get(group) || []
  values.push(page)
  groups.set(group, values)
}

const conceptSlots = new Map()
for (const page of pages) {
  for (const module of page.modules || []) {
    for (const slot of slotDescriptors(page, module)) {
      const index = slot.path.find((part) => typeof part === 'number') ?? 0
      const key = [page.translationGroup || page._id, module._key, slot.field, index].join('|')
      const values = conceptSlots.get(key) || []
      values.push(slot)
      conceptSlots.set(key, values)
    }
  }
}

function siblingImage(slots) {
  for (const slot of slots) {
    const image = currentImageAt(slot.module, slot.path)
    const ref = image?.asset?._ref || image?.asset?._id
    if (ref && assetMeta.has(ref)) return { ref, alt: image.alt }
  }
  return null
}

function scoreCandidate(candidate, context, group) {
  const contextTokens = tokens(context)
  const candidateTokens = tokens([...candidate.text].join(' '))
  let matches = 0
  for (const token of contextTokens) {
    if (candidateTokens.has(token)) matches += token.length > 5 ? 3 : 2
  }
  const localBonus = candidate.groups.has(group) ? 1.25 : 0
  const resolutionBonus = candidate.width >= 900 ? 0.2 : 0
  return matches + localBonus + resolutionBonus
}

function makeKey(value) {
  return `auto-${createHash('sha1').update(value).digest('hex').slice(0, 12)}`
}

const selectedByGroup = new Map()
const assignmentPlan = []
const usageByGroup = new Map()

for (const [conceptKey, slots] of conceptSlots) {
  const [group] = conceptKey.split('|')
  const existing = siblingImage(slots)
  let chosen = existing

  if (!chosen) {
    const preferred = slots.find((slot) => slot.page.language === 'en') || slots[0]
    const pool = [...allCandidates.values()].filter((candidate) => assetMeta.has(candidate.ref))
    const used = usageByGroup.get(group) || new Map()
    const ranked = pool
      .filter((candidate) => !/logo|tripadvisor|star|icon|avatar/iu.test([...candidate.text].join(' ')))
      .map((candidate) => {
        const score = scoreCandidate(candidate, preferred.context, group)
        const priorUses = used.get(candidate.ref) || 0
        return { candidate, score: score - priorUses * 4 }
      })
      .sort((a, b) => b.score - a.score)

    if (!ranked.length) throw new Error(`Aucune photo Sanity utilisable pour ${conceptKey}`)
    chosen = { ref: ranked[0].candidate.ref, alt: [...ranked[0].candidate.text][0] }
    used.set(chosen.ref, (used.get(chosen.ref) || 0) + 1)
    usageByGroup.set(group, used)
  }

  selectedByGroup.set(conceptKey, chosen)
  for (const slot of slots) assignmentPlan.push({ ...slot, conceptKey, chosen })
}

const changedPages = new Map()
for (const assignment of assignmentPlan) {
  const { page, module, path, chosen, conceptKey } = assignment
  if (!changedPages.has(page._id)) {
    changedPages.set(page._id, {
      page,
      modules: JSON.parse(JSON.stringify(page.modules || [])),
      counts: {},
    })
  }

  const update = changedPages.get(page._id)
  const targetModule = update.modules.find((item) => item._key === module._key)
  if (!targetModule) throw new Error(`Bloc introuvable ${page._id}/${module._key}`)

  let cursor = targetModule
  for (let i = 0; i < path.length - 1; i += 1) {
    const part = path[i]
    if (typeof part === 'number') {
      if (!Array.isArray(cursor)) throw new Error(`Chemin tableau incorrect: ${conceptKey}`)
      if (part >= cursor.length) {
        while (cursor.length <= part) cursor.push(null)
      }
      if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {}
      cursor = cursor[part]
    } else {
      if (cursor[part] === undefined || cursor[part] === null) {
        cursor[part] = typeof path[i + 1] === 'number' ? [] : {}
      }
      cursor = cursor[part]
    }
  }

  const finalPart = path.at(-1)
  if (typeof finalPart === 'number') {
    if (!Array.isArray(cursor)) throw new Error(`Chemin tableau incorrect: ${conceptKey}`)
    if (finalPart >= cursor.length) {
      while (cursor.length <= finalPart) cursor.push(null)
    }
    if (assignment.field === 'puzzleImage' && !cursor[finalPart]) {
      const sizes = ['wide', 'small', 'tall', 'small', 'large', 'wide']
      cursor[finalPart] = { _key: makeKey(`${conceptKey}:item`), size: sizes[finalPart % sizes.length] }
    }
    if (!cursor[finalPart] || typeof cursor[finalPart] !== 'object') cursor[finalPart] = {}
    cursor[finalPart][path[path.length - 2]] = {
      _type: 'image',
      _key: makeKey(`${conceptKey}:image`),
      asset: { _type: 'reference', _ref: chosen.ref },
      alt: chosen.alt || module.title || page.title,
    }
  } else {
    cursor[finalPart] = {
      _type: 'image',
      _key: makeKey(`${conceptKey}:image`),
      asset: { _type: 'reference', _ref: chosen.ref },
      alt: chosen.alt || module.title || page.title,
    }
  }

  update.counts[module._type] = (update.counts[module._type] || 0) + 1
}

console.log(`Pages lues : ${pages.length}`)
console.log(`Emplacements image à remplir : ${assignmentPlan.length}`)
console.log(`Documents concernés : ${changedPages.size}`)
for (const [group, docs] of groups) {
  const slots = assignmentPlan.filter((item) => (item.page.translationGroup || item.page._id) === group)
  if (slots.length) {
    console.log(`- ${group}: ${slots.length} emplacement(s), ${new Set(slots.map((slot) => slot.chosen.ref)).size} photos distinctes`)
  }
}
for (const item of assignmentPlan.slice(0, 12)) {
  console.log(`  aperçu ${item.page.language}/${item.page.slug} · ${item.module.title || item.module._type} → ${item.chosen.alt || item.chosen.ref}`)
}

if (!apply) {
  console.log('Simulation uniquement. Ajoutez --apply pour écrire dans Sanity.')
} else {
  const transaction = client.transaction()
  for (const { page, modules } of changedPages.values()) {
    transaction.patch(page._id, (patch) =>
      patch.ifRevisionId(page._rev).set({ modules }),
    )
  }
  const result = await transaction.commit()
  console.log(`Documents Sanity modifiés : ${result.results.length}`)

  const verified = await client.fetch(`
    *[_type == "page" && !(_id in path("drafts.**"))]{
      _id, language, translationGroup, modules[]{...}
    }
  `)
  let remaining = 0
  for (const page of verified) {
    for (const module of page.modules || []) {
      if (module.settings?.hidden) continue
      if (module._type === 'heroBlock' && !isRenderableImage(module.backgroundImage)) remaining += 1
      if (module._type === 'textMediaBlock' && !isRenderableImage(module.image)) remaining += 1
      if (module._type === 'alternatingBlock') {
        if (Array.isArray(module.images) && module.images.length) {
          remaining += module.images.filter((image) => !isRenderableImage(image)).length
        } else if (!isRenderableImage(module.image)) remaining += 1
        remaining += (module.floatingImages || []).filter((image) => !isRenderableImage(image.image)).length
      }
      if (module._type === 'imageBlock' && !isRenderableImage(module.image)) remaining += 1
      if (module._type === 'puzzleGalleryBlock') {
        const items = Array.isArray(module.items) && module.items.length
          ? module.items
          : [null, null, null, null, null, null]
        remaining += items.filter((item) => !isRenderableImage(item?.image)).length
      }
      if (module._type === 'galleryBlock') {
        const images = Array.isArray(module.images) && module.images.length
          ? module.images
          : [null, null, null, null, null, null]
        remaining += images.filter((image) => !isRenderableImage(image)).length
      }
    }
  }
  console.log(`Vérification des placeholders : ${remaining} emplacement(s) restant(s).`)
  if (remaining) process.exitCode = 1
}
