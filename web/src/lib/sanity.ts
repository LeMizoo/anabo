import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-06',
  useCdn: process.env.NODE_ENV === 'production',
}

export const sanityClient = createClient(sanityConfig)

export const sanityClientWithToken = createClient({
  ...sanityConfig,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

function isImageAssetId(value: unknown): value is string {
  return typeof value === 'string' &&
    /^image-[a-zA-Z0-9]+-\d+x\d+-[a-zA-Z0-9]+$/.test(value)
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function getImageUrl(
  source: SanityImageSource | null | undefined,
  width: number = 1200,
  quality: number = 80
): string | null {
  if (!source) return null

  if (typeof source === 'string') {
    if (isHttpUrl(source)) return source
    if (!isImageAssetId(source)) return null
  } else {
    const asset = 'asset' in source ? source.asset : source
    if (!asset || typeof asset !== 'object') return null

    const reference = '_ref' in asset && isImageAssetId(asset._ref)
      ? asset._ref
      : '_id' in asset && isImageAssetId(asset._id)
        ? asset._id
        : null

    if (!reference) {
      const url = 'url' in asset ? asset.url : null
      return isHttpUrl(url) ? url : null
    }

    const hasInvalidReference =
      ('_ref' in asset && asset._ref !== undefined && !isImageAssetId(asset._ref)) ||
      ('_id' in asset && asset._id !== undefined && !isImageAssetId(asset._id))
    if (hasInvalidReference) {
      const url = 'url' in asset ? asset.url : null
      return isHttpUrl(url) ? url : null
    }
  }

  return urlFor(source)
    .width(width)
    .quality(quality)
    .auto('format')
    .url()
}
