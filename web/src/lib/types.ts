export interface SiteTypography {
  globalHeadingFont?: string
  globalHeadingWeight?: string
  globalBodyFont?: string
}

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
  // 👇 Ajout du champ typographie 👇
  typography?: SiteTypography
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

export interface PuzzleItem {
  _key: string
  image: SanityImage
  size: 'small' | 'wide' | 'tall' | 'large'
  caption?: string
}

export interface PuzzleGalleryBlock {
  _type: 'puzzleGalleryBlock'
  title?: string
  items?: PuzzleItem[]
}

export interface AlternatingBlock {
  _type: 'alternatingBlock'
  title: string
  subtitle?: string
  subtitleFont?: string
  titleFont?: string
  titleWeight?: string
  subtitleWeight?: string
  content?: unknown[]
  image?: SanityImage
  imagePosition?: 'left' | 'right'
  backgroundColor?: 'white' | 'cream'
}

export interface FeaturesBlock {
  _type: 'featuresBlock'
  title?: string
  titleFont?: string
  titleWeight?: string
  content?: string
  features?: {
    _key: string
    title: string
    description: string
    icon?: string
  }[]
}

export interface CommitmentsBlock {
  _type: 'commitmentsBlock'
  title?: string
  titleFont?: string
  titleWeight?: string
  subtitle?: string
  subtitleFont?: string
  sections?: {
    _key: string
    title: string
    items?: {
      _key: string
      label: string
      text: string
    }[]
  }[]
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
  titleFont?: string
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
  variant?: 'primary' | 'secondary' | 'brown'
}

export interface ContactFormBlock {
  _type: 'contactFormBlock'
  title?: string
  description?: string
  formType?: 'contact' | 'quote'
  showWhatsapp?: boolean
}

export interface Slider3DSlide {
  title?: string
  subtitle?: string
  alt?: string
  linkLabel?: string
  linkUrl?: string
  imageUrl?: string
}

export interface Slider3DBlock {
  _type: 'slider3dBlock'
  title?: string
  autoplay?: boolean
  interval?: number
  slides?: Slider3DSlide[]
}

export type PageModule =
  | HeroBlock
  | TextMediaBlock
  | CtaBlock
  | ContactFormBlock
  | Slider3DBlock
  | PuzzleGalleryBlock
  | AlternatingBlock
  | FeaturesBlock
  | CommitmentsBlock

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
  modules?: (
    | HeroBlock
    | Slider3DBlock
    | ContactFormBlock
    | PuzzleGalleryBlock
    | AlternatingBlock
    | FeaturesBlock
    | CommitmentsBlock
  )[]
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

export interface Circuit {
  slug: string
  title: string
}