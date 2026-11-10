export interface SiteTypography {
  globalHeadingFont?: string
  globalHeadingWeight?: string
  globalBodyFont?: string
}

export type BrandTextColor = 'navy' | 'gold' | 'charcoal' | 'white'

export interface SiteSettings {
  _id: string
  logo?: SanityImage
  siteName?: string
  tagline?: string
  description?: string
  localized?: {
    en?: { siteName?: string; tagline?: string; description?: string }
    fr?: { siteName?: string; tagline?: string; description?: string }
    it?: { siteName?: string; tagline?: string; description?: string }
  }
  typography?: SiteTypography
  header?: {
    showLogo?: boolean
    logoHeight?: number
    logoOpacity?: number
    sticky?: boolean
    showNavigation?: boolean
    showThemeToggle?: boolean
    showLanguageSwitcher?: boolean
  }
  footer?: {
    showTagline?: boolean
    showDescription?: boolean
    showNavigation?: boolean
    showContact?: boolean
    showSocialLinks?: boolean
  }
  contactEmail?: string
  contactPhone?: string
  whatsappNumber?: string
  showFloatingWhatsapp?: boolean
  address?: string
  socialLinks?: { platform?: string; url?: string }[]
}

export interface SanityImage {
  _id?: string
  asset?: {
    _id?: string
    url?: string
    metadata?: { dimensions?: { width?: number; height?: number } }
    [key: string]: unknown
  }
  alt?: string
  presentation?: ImagePresentation
  [key: string]: unknown
}

export interface ImagePresentation {
  rotation?: '-10' | '-5' | '0' | '5' | '10'
  border?: 'none' | 'light' | 'dark' | 'accent'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  fit?: 'cover' | 'contain'
  position?: 'center' | 'top' | 'right' | 'bottom' | 'left'
}

export interface PageCta {
  label?: string
  link?: string
}

// Réglages communs
export interface BlockSettings {
  anchorId?: string
  background?: 'white' | 'cream' | 'navy'
  spacing?: 'sm' | 'md' | 'lg'
  contentWidth?: 'standard' | 'wide' | 'full'
  hidden?: boolean
}

export interface PuzzleItem {
  _key: string
  image?: SanityImage
  size?: 'small' | 'wide' | 'tall' | 'large'
  overlap?: 'none' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  pixelation?: 'none' | 'low' | 'medium' | 'high'
  overlay?: 'none' | 'dark' | 'light' | 'accent'
  caption?: string
}

export interface PuzzleGalleryBlock {
  _type: 'puzzleGalleryBlock'
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  layout?: 'balanced' | 'manual'
  items?: PuzzleItem[]
  settings?: BlockSettings
}

export interface AlternatingBlock {
  _type: 'alternatingBlock'
  title?: string
  titleColor?: BrandTextColor
  subtitle?: string
  subtitleFont?: string
  subtitleColor?: BrandTextColor
  subtitleSize?: string
  titleFont?: string
  titleSize?: string
  titleWeight?: string
  subtitleWeight?: string
  content?: unknown[]
  image?: SanityImage
  images?: (SanityImage & { _key?: string })[]
  floatingImages?: {
    _key: string
    image: SanityImage
    size: 'sm' | 'md' | 'lg'
    position:
      | 'top-left'
      | 'top-right'
      | 'center-left'
      | 'center-right'
      | 'bottom-left'
      | 'bottom-right'
  }[]
  imagePosition?: 'left' | 'right'
  imageSize?: 'sm' | 'md' | 'lg'
  contentVerticalAlignment?: 'top' | 'center' | 'bottom'
  backgroundColor?: 'white' | 'cream'
  settings?: BlockSettings
}

export interface CardsBlock {
  _type: 'cardsBlock'
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  description?: string
  cards?: {
    _key: string
    title?: string
    titleFont?: string
    titleWeight?: string
    titleColor?: BrandTextColor
    titleSize?: string
    description?: string
    image?: SanityImage
    cta?: PageCta
  }[]
  columns?: '2' | '3' | '4'
  imagePosition?: 'top' | 'bottom'
  textAlignment?: 'left' | 'center' | 'right'
  cardStyle?: 'simple' | 'bordered' | 'shadow'
  backgroundColor?: 'white' | 'cream' | 'navy'
  settings?: BlockSettings
}

export interface FeaturesBlock {
  _type: 'featuresBlock'
  title?: string
  titleFont?: string
  titleColor?: BrandTextColor
  titleSize?: string
  titleWeight?: string
  content?: string
  features?: {
    _key: string
    title: string
    description: string
    icon?: string
  }[]
  settings?: BlockSettings
}

export interface CommitmentsBlock {
  _type: 'commitmentsBlock'
  title?: string
  titleFont?: string
  titleColor?: BrandTextColor
  titleWeight?: string
  subtitle?: string
  subtitleFont?: string
  subtitleColor?: BrandTextColor
  subtitleSize?: string
  sections?: {
    _key: string
    title: string
    items?: {
      _key: string
      label: string
      text: string
    }[]
  }[]
  settings?: BlockSettings
}

export interface HeroBlock {
  _type: 'heroBlock'
  title: string
  subtitle?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  subtitleFont?: string
  subtitleColor?: BrandTextColor
  subtitleSize?: string
  backgroundImage?: SanityImage
  backgroundImagePosition?: string
  backgroundImageFit?: 'cover' | 'contain'
  backgroundImageMotion?: 'none' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'ken-burns'
  backgroundImageMotionDuration?: number
  contentAnimation?: 'none' | 'fade-in' | 'fade-up' | 'slide-left' | 'slide-right'
  height?: 'compact' | 'standard' | 'tall' | 'screen'
  overlay?: boolean
  overlayOpacity?: number
  alignment?: 'left' | 'center' | 'right'
  ctaPrimary?: PageCta
  ctaSecondary?: PageCta
  settings?: BlockSettings
}

export interface TextMediaBlock {
  _type: 'textMediaBlock'
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  content?: unknown[]
  image?: SanityImage
  imageSize?: 'sm' | 'md' | 'lg'
  imagePosition?: 'left' | 'right' | 'top' | 'bottom'
  cta?: PageCta
  settings?: BlockSettings
}

export interface CtaBlock {
  _type: 'ctaBlock'
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  description?: string
  buttonLabel?: string
  buttonLink?: string
  variant?: 'primary' | 'secondary'
  settings?: BlockSettings
}

export interface ContactFormBlock {
  _type: 'contactFormBlock'
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  description?: string
  formType?: 'contact' | 'quote' | 'both'
  showWhatsapp?: boolean
  settings?: BlockSettings
}

export interface Slider3DSlide {
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  subtitle?: string
  subtitleFont?: string
  subtitleColor?: BrandTextColor
  subtitleSize?: string
  alt?: string
  linkLabel?: string
  linkUrl?: string
  imageUrl?: string
  imagePresentation?: ImagePresentation
  imagePosition?: string
  imageFit?: 'cover' | 'contain'
}

export interface Slider3DBlock {
  _type: 'slider3dBlock'
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  autoplay?: boolean
  interval?: number
  slides?: Slider3DSlide[]
  settings?: BlockSettings
}

export interface TestimonialBlock {
  _type: 'testimonialBlock'
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  layout?: 'carousel' | 'grid'
  testimonials?: {
    _id: string
    authorName: string
    authorCountry?: string
    authorPhoto?: SanityImage
    testimonialImage?: SanityImage
    content: string
    rating?: number
  }[]
  settings?: BlockSettings
}

export interface GalleryBlock {
  _type: 'galleryBlock'
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  images?: (SanityImage & { _key?: string; caption?: string })[]
  settings?: BlockSettings
}

export interface ImageBlock {
  _type: 'imageBlock'
  image?: SanityImage
  scale?: '25' | '50' | '75' | '100'
  crop?: 'original' | 'square' | 'landscape' | 'portrait'
  settings?: BlockSettings
}

export interface HeadingBlock {
  _type: 'headingBlock'
  title?: string
  subtitle?: string
  titleFont?: string
  titleColor?: BrandTextColor
  titleSize?: string
  titleWeight?: string
  subtitleFont?: string
  subtitleColor?: BrandTextColor
  subtitleSize?: string
  subtitleWeight?: string
  alignment?: 'left' | 'center' | 'right'
  settings?: BlockSettings
}

export interface FaqBlock {
  _type: 'faqBlock'
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  items?: {
    _key: string
    question: string
    answer?: unknown[]
  }[]
  settings?: BlockSettings
}

export interface TripadvisorBlock {
  _type: 'tripadvisorBlock'
  title?: string
  titleFont?: string
  titleWeight?: string
  titleColor?: BrandTextColor
  titleSize?: string
  showBadge?: boolean
  showCarousel?: boolean
  reviewLimit?: number
  settings?: BlockSettings
}

// PageModule complet
export type PageModule =
  | HeroBlock
  | TextMediaBlock
  | CtaBlock
  | ContactFormBlock
  | Slider3DBlock
  | PuzzleGalleryBlock
  | AlternatingBlock
  | CardsBlock
  | FeaturesBlock
  | CommitmentsBlock
  | TestimonialBlock
  | GalleryBlock
  | ImageBlock
  | HeadingBlock
  | FaqBlock
  | TripadvisorBlock

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
  routeStops?: string[]
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
  routeStops?: string[]
  modules?: PageModule[]
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