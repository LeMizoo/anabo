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

export function getImageUrl(
  source: SanityImageSource | null | undefined,
  width: number = 1200,
  quality: number = 80
): string | null {
  if (!source) return null

  if (typeof source !== 'string') {
    if ('asset' in source) {
      const asset = source.asset as
        | { _ref?: unknown; _id?: unknown; url?: unknown }
        | null
        | undefined

      if (!asset || typeof asset !== 'object') return null

      const hasReference =
        (typeof asset._ref === 'string' && asset._ref.length > 0) ||
        (typeof asset._id === 'string' && asset._id.length > 0)

      if (!hasReference) {
        return typeof asset.url === 'string' && asset.url.length > 0
          ? asset.url
          : null
      }
    } else if (
      !('_ref' in source && typeof source._ref === 'string' && source._ref.length > 0) &&
      !('_id' in source && typeof source._id === 'string' && source._id.length > 0)
    ) {
      return null
    }
  }

  return urlFor(source)
    .width(width)
    .quality(quality)
    .auto('format')
    .url()
}
