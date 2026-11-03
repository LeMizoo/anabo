// web/src/lib/queries.ts

export const siteSettingsQuery = `
  *[_type == "siteSettings"][0]{
    _id,
    siteName,
    tagline,
    description,
    localized{
      en{siteName, tagline, description},
      fr{siteName, tagline, description},
      it{siteName, tagline, description}
    },
    typography {
      globalHeadingFont,
      globalHeadingWeight,
      globalBodyFont
    },
    contactEmail,
    contactPhone,
    whatsappNumber,
    address,
    socialLinks[]{
      platform,
      url
    }
  }
`

const pageModulesProjection = `
  _type,
  settings,
  _type == "heroBlock" => {
    title,
    subtitle,
    titleFont,
    titleSize,
    subtitleFont,
    subtitleSize,
    backgroundImage{ ..., asset->, alt },
    backgroundImagePosition,
    backgroundImageFit,
    overlay,
    alignment,
    ctaPrimary{ label, link },
    ctaSecondary{ label, link }
  },
  _type == "textMediaBlock" => {
    title,
    titleFont,
    titleSize,
    content,
    image{ ..., asset->, alt },
    imagePosition,
    imageSize,
    cta{ label, link }
  },
  _type == "ctaBlock" => {
    title,
    titleFont,
    titleSize,
    description,
    buttonLabel,
    buttonLink,
    variant
  },
  _type == "contactFormBlock" => {
    title,
    titleFont,
    titleSize,
    description,
    formType,
    showWhatsapp
  },
  _type == "slider3dBlock" => {
    title,
    titleFont,
    titleSize,
    autoplay,
    interval,
    slides[]{
      title,
      titleFont,
      titleSize,
      subtitle,
      subtitleFont,
      subtitleSize,
      alt,
      linkLabel,
      linkUrl,
      "imageUrl": image.asset->url,
      imagePosition,
      imageFit
    }
  },
  _type == "alternatingBlock" => {
    title,
    subtitle,
    titleFont,
    titleSize,
    titleWeight,
    subtitleFont,
    subtitleSize,
    subtitleWeight,
    content,
    imagePosition,
    imageSize,
    backgroundColor,
    image{ ..., asset->, alt },
    floatingImages[]{
      _key,
      size,
      position,
      image{ ..., asset->, alt }
    }
  },
  _type == "puzzleGalleryBlock" => {
    title,
    titleFont,
    titleSize,
    items[]{
      _key,
      caption,
      size,
      image{ ..., asset->, alt }
    }
  },
  _type == "featuresBlock" => {
    title,
    titleFont,
    titleSize,
    titleWeight,
    content,
    features[]{ _key, title, description, icon }
  },
  _type == "commitmentsBlock" => {
    title,
    titleFont,
    titleSize,
    titleWeight,
    subtitle,
    subtitleFont,
    subtitleSize,
    sections[]{
      _key,
      title,
      items[]{ _key, label, text }
    }
  },
  _type == "galleryBlock" => {
    title,
    titleFont,
    titleSize,
    images[]{ ..., asset->, alt, caption }
  },
  _type == "testimonialBlock" => {
    title,
    titleFont,
    titleSize,
    layout,
    testimonials[]->{
      _id,
      authorName,
      authorCountry,
      authorPhoto{ ..., asset->, alt },
      content,
      rating
    }
  },
  _type == "faqBlock" => {
    title,
    titleFont,
    titleSize,
    items[]{ _key, question, answer }
  },
  _type == "tripadvisorBlock" => {
    title,
    titleFont,
    titleSize,
    showBadge,
    showCarousel,
    reviewLimit
  }
`

export const homePageQuery = `
  *[_type == "page" && pageType == "home" && language == $locale][0]{
    _id,
    title,
    "slug": slug.current,
    language,
    translationGroup,
    pageType,
    excerpt,
    routeStops,
    featuredImage{ ..., asset->, alt },
    modules[]{
      ${pageModulesProjection}
    }
  }
`

export const pageBySlugQuery = `
  *[_type == "page" && slug.current == $slug && language == $locale && pageType != "home"][0]{
    _id,
    title,
    "slug": slug.current,
    language,
    translationGroup,
    pageType,
    excerpt,
    routeStops,
    featuredImage{ ..., asset->, alt },
    seo{
      metaTitle,
      metaDescription,
      keywords,
      ogImage{ ..., asset->, alt },
      canonicalUrl,
      noIndex
    },
    modules[]{
      ${pageModulesProjection}
    }
  }
`

export const featuredTestimonialQuery = `
  *[_type == "testimonial" && featured == true][0]{
    _id,
    authorName,
    authorCountry,
    authorPhoto{ ..., asset-> },
    content,
    rating,
    source,
    date,
    featured
  }
`

export const tourIdeasQuery = `
  *[_type == "page" && (pageType == "circuit" || pageType == "custom-trip") && language == $locale] | order(pageType desc, title asc) {
    _id,
    title,
    "slug": slug.current,
    pageType,
    excerpt,
    routeStops,
    featuredImage{ ..., asset->, alt }
  }
`

export const circuitsQuery = `
  *[_type == "page" && (pageType == "circuit" || pageType == "custom-trip") && language == $locale] | order(title asc) {
    "slug": slug.current,
    title
  }
`