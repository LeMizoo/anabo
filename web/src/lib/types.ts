export interface SiteSettings {
  _id: string
  siteName?: string
  tagline?: string
  description?: string
  localized?: {
    en?: { siteName?: string; tagline?: string; description?: string }
    fr?: { siteName?: string; tagline?: string; description?: string }
    it?: { siteName?: string; tagline?: string; description?: string }
  }
  contactEmail?: string
  contactPhone?: string
  whatsappNumber?: string
  address?: string
  socialLinks?: { platform?: string; url?: string }[]
}

export interface SanityImage {
  _id?: string
  asset?: { _id?: string; url?: string; [key: string]: unknown }
  alt?: string
  [key: string]: unknown
}

export interface PageCta {
  label?: string
  link?: string
}

export interface HeroBlock {
  _type: 'heroBlock'
  title: string
  subtitle?: string
  backgroundImage?: SanityImage
  overlay?: boolean
  alignment?: 'left' | 'center' | 'right'
  ctaPrimary?: PageCta
  ctaSecondary?: PageCta
}

export interface TextMediaBlock {
  _type: 'textMediaBlock'
  title?: string
  content?: unknown[]
  image?: SanityImage
  imagePosition?: 'left' | 'right'
  cta?: PageCta
}

export interface CtaBlock {
  _type: 'ctaBlock'
  title?: string
  description?: string
  buttonLabel?: string
  buttonLink?: string
  variant?: 'primary' | 'secondary'
}

export interface ContactFormBlock {
  _type: 'contactFormBlock'
  title?: string
  description?: string
  formType?: 'contact' | 'quote'
  showWhatsapp?: boolean
}

export type PageModule =
  | HeroBlock
  | TextMediaBlock
  | CtaBlock
  | ContactFormBlock

export interface PageSeo {
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  ogImage?: SanityImage
  canonicalUrl?: string
  noIndex?: boolean
}

export type PageLanguage = 'fr' | 'en' | 'it'

export interface Page {
  _id: string
  title: string
  slug?: string
  language?: PageLanguage
  translationGroup?: string
  pageType?: string
  excerpt?: string
  featuredImage?: SanityImage
  seo?: PageSeo
  modules?: PageModule[]
}

export interface HomePage {
  _id: string
  title: string
  slug?: string
  language?: PageLanguage
  translationGroup?: string
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
