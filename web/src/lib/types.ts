// web/src/lib/types.ts

export interface SiteSettings {
  _id: string
  siteName?: string
  tagline?: string
  description?: string
  localized?: {
    en?: {
      siteName?: string
      tagline?: string
      description?: string
    }
    fr?: {
      siteName?: string
      tagline?: string
      description?: string
    }
    it?: {
      siteName?: string
      tagline?: string
      description?: string
    }
  }
  contactEmail?: string
  contactPhone?: string
  whatsappNumber?: string
  address?: string
  socialLinks?: {
    platform?: string
    url?: string
  }[]
}

export interface SanityImage {
  _id?: string
  asset?: {
    _id?: string
    url?: string
  }
  alt?: string
}

export interface HeroBlock {
  _type: 'heroBlock'
  title: string
  subtitle?: string
  backgroundImage?: SanityImage
  overlay?: boolean
  alignment?: 'left' | 'center' | 'right'
  ctaPrimary?: {
    label?: string
    link?: string
  }
  ctaSecondary?: {
    label?: string
    link?: string
  }
}

export interface HomePage {
  _id: string
  title: string
  slug?: string
  pageType?: string
  excerpt?: string
  featuredImage?: SanityImage
  modules?: HeroBlock[]
}

export interface Testimonial {
  _id: string
  authorName: string
  authorCountry?: string
  authorPhoto?: SanityImage
  content: string
  rating?: number
  source?: string
  date?: string
  featured?: boolean
}