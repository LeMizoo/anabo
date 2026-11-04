// web/src/lib/queries.ts

export const siteSettingsQuery = `
  *[_type == "siteSettings"][0]{
    _id,
    logo{ ..., asset->{url, metadata{dimensions}}, alt },
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
    header {
      showLogo,
      logoHeight,
      logoOpacity,
      sticky,
      showNavigation,
      showThemeToggle,
      showLanguageSwitcher
    },
    footer {
      showTagline,
      showDescription,
      showNavigation,
      showContact,
      showSocialLinks
    },
    contactEmail,
    contactPhone,
    whatsappNumber,
    showFloatingWhatsapp,
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
    titleColor,
    titleSize,
    subtitleFont,
    subtitleColor,
    subtitleSize,
    backgroundImage{ ..., asset->, alt, presentation },
    backgroundImagePosition,
    backgroundImageFit,
    backgroundImageMotion,
    backgroundImageMotionDuration,
    contentAnimation,
    height,
    overlay,
    overlayOpacity,
    alignment,
    ctaPrimary{ label, link },
    ctaSecondary{ label, link }
  },
  _type == "textMediaBlock" => {
    title,
    titleFont,
    titleColor,
    titleSize,
    content,
    image{ ..., asset->, alt, presentation },
    imagePosition,
    imageSize,
    cta{ label, link }
  },
  _type == "ctaBlock" => {
    title,
    titleFont,
    titleColor,
    titleSize,
    description,
    buttonLabel,
    buttonLink,
    variant
  },
  _type == "contactFormBlock" => {
    title,
    titleFont,
    titleColor,
    titleSize,
    description,
    formType,
    showWhatsapp
  },
  _type == "slider3dBlock" => {
    title,
    titleFont,
    titleColor,
    titleSize,
    autoplay,
    interval,
    slides[]{
      title,
      titleFont,
      titleColor,
      titleSize,
      subtitle,
      subtitleFont,
      subtitleColor,
      subtitleSize,
      alt,
      linkLabel,
      linkUrl,
      "imageUrl": image.asset->url,
      "imagePresentation": image.presentation,
      imagePosition,
      imageFit
    }
  },
  _type == "alternatingBlock" => {
    title,
    subtitle,
    titleFont,
    titleColor,
    titleSize,
    titleWeight,
    subtitleFont,
    subtitleColor,
    subtitleSize,
    subtitleWeight,
    content,
    imagePosition,
    imageSize,
    backgroundColor,
    image{ ..., asset->, alt, presentation },
    floatingImages[]{
      _key,
      size,
      position,
      image{ ..., asset->, alt, presentation }
    }
  },
  _type == "puzzleGalleryBlock" => {
    title,
    titleFont,
    titleColor,
    titleSize,
    layout,
    items[]{
      _key,
      caption,
      size,
      overlap,
      pixelation,
      overlay,
      image{ ..., asset->, alt, presentation }
    }
  },
  _type == "featuresBlock" => {
    title,
    titleFont,
    titleColor,
    titleSize,
    titleWeight,
    content,
    features[]{ _key, title, description, icon }
  },
  _type == "commitmentsBlock" => {
    title,
    titleFont,
    titleColor,
    titleSize,
    titleWeight,
    subtitle,
    subtitleFont,
    subtitleColor,
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
    titleColor,
    titleSize,
    images[]{ ..., asset->, alt, caption, presentation }
  },
  _type == "imageBlock" => {
    image{ ..., asset->{_id, url, metadata{dimensions}}, alt, presentation },
    scale,
    crop
  },
  _type == "headingBlock" => {
    title,
    subtitle,
    titleFont,
    titleColor,
    titleSize,
    titleWeight,
    subtitleFont,
    subtitleColor,
    subtitleSize,
    subtitleWeight,
    alignment
  },
  _type == "testimonialBlock" => {
    title,
    titleFont,
    titleColor,
    titleSize,
    layout,
    testimonials[]->{
      _id,
      authorName,
      authorCountry,
      authorPhoto{ ..., asset->, alt },
      testimonialImage{ ..., asset->, alt },
      content,
      rating
    }
  },
  _type == "faqBlock" => {
    title,
    titleFont,
    titleColor,
    titleSize,
    items[]{ _key, question, answer }
  },
  _type == "tripadvisorBlock" => {
    title,
    titleFont,
    titleColor,
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