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
  source: SanityImageSource,
  width: number = 1200,
  quality: number = 80
): string {
  return urlFor(source)
    .width(width)
    .quality(quality)
    .auto('format')
    .url()
}
