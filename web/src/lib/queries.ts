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

export const homePageQuery = `
  *[_type == "page" && pageType == "home"][0]{
    _id,
    title,
    "slug": slug.current,
    language,
    translationGroup,
    pageType,
    excerpt,
    featuredImage{
      ...,
      asset->,
      alt
    },
    modules[]{
      _type,

      _type == "heroBlock" => {
        title,
        subtitle,
        backgroundImage{
          ...,
          asset->,
          alt
        },
        overlay,
        alignment,
        ctaPrimary{
          label,
          link
        },
        ctaSecondary{
          label,
          link
        }
      },

      _type == "slider3dBlock" => {
        title,
        autoplay,
        interval,
        slides[]{
          title,
          subtitle,
          alt,
          linkLabel,
          linkUrl,
          "imageUrl": image.asset->url
        }
      },

      _type == "contactFormBlock" => {
        title,
        description,
        formType,
        showWhatsapp
      }
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
    featuredImage{
      ...,
      asset->,
      alt
    },
    seo{
      metaTitle,
      metaDescription,
      keywords,
      ogImage{
        ...,
        asset->,
        alt
      },
      canonicalUrl,
      noIndex
    },
    modules[]{
      _type,

      _type == "heroBlock" => {
        title,
        subtitle,
        backgroundImage{
          ...,
          asset->,
          alt
        },
        overlay,
        alignment,
        ctaPrimary{
          label,
          link
        },
        ctaSecondary{
          label,
          link
        }
      },

      _type == "textMediaBlock" => {
        title,
        titleFont,
        content,
        image{
          ...,
          asset->,
          alt
        },
        imagePosition,
        cta{
          label,
          link
        }
      },

      _type == "ctaBlock" => {
        title,
        description,
        buttonLabel,
        buttonLink,
        variant
      },

      _type == "contactFormBlock" => {
        title,
        description,
        formType,
        showWhatsapp
      },

      _type == "slider3dBlock" => {
        title,
        autoplay,
        interval,
        slides[]{
          title,
          subtitle,
          alt,
          linkLabel,
          linkUrl,
          "imageUrl": image.asset->url
        }
      }
    }
  }
`

export const featuredTestimonialQuery = `
  *[_type == "testimonial" && featured == true][0]{
    _id,
    authorName,
    authorCountry,
    authorPhoto{
      ...,
      asset->
    },
    content,
    rating,
    source,
    date,
    featured
  }
`

// 👇 NOUVELLE REQUÊTE POUR LA PAGE TOUR IDEAS 👇
export const tourIdeasQuery = `
  *[_type == "page" && (pageType == "circuit" || pageType == "custom-trip") && language == $locale] | order(pageType desc, title asc) {
    _id,
    title,
    "slug": slug.current,
    pageType,
    excerpt,
    featuredImage{
      ...,
      asset->,
      alt
    }
  }
`

// 👇 NOUVELLE REQUÊTE POUR LE MENU DÉROULANT DU FORMULAIRE 👇
export const circuitsQuery = `
  *[_type == "page" && (pageType == "circuit" || pageType == "custom-trip") && language == $locale] | order(title asc) {
    "slug": slug.current,
    title
  }
`