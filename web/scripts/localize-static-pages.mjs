import nextEnv from '@next/env'
import { createClient } from '@sanity/client'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const translations = {
  fr: {
    about: {
      pageTitle: 'À propos d’Anabo Roadtrip Madagascar',
      excerpt:
        'Rencontrez Vonjy, votre guide-chauffeur à Madagascar, et découvrez des circuits adaptés à vos envies.',
      heroTitle: 'Je suis Vonjy, votre guide-chauffeur à Madagascar',
      heroSubtitle:
        'Je vous accompagne pour découvrir l’île à travers un road trip adapté à vos envies.',
      sections: [
        {
          title: 'Une île aux mille paysages',
          paragraphs: [
            'Madagascar est une île-continent aux paysages et aux cultures variés. Des forêts tropicales aux Hautes Terres, des formations rocheuses aux côtes et aux plages, chaque région révèle un autre visage de l’île.',
            'Sa nature singulière, ses baobabs, ses lémuriens et la richesse de sa culture font de chaque itinéraire une découverte différente.',
          ],
          alt: 'Paysage de Madagascar',
        },
        {
          title: 'Un road trip accompagné par un guide-chauffeur',
          paragraphs: [
            'Anabo Roadtrip Madagascar propose des circuits sur mesure accompagnés par un chauffeur-guide. Je vous accompagne dans la découverte du pays et vous aide à imaginer un itinéraire adapté à vos envies, au temps disponible et aux régions que vous souhaitez explorer.',
          ],
          alt: 'Baobab de Madagascar',
        },
        {
          title: 'Des itinéraires pour explorer l’île',
          paragraphs: [
            'De la RN7 et du Sud aux forêts de l’Est, du Nord et Nosy Be, ou encore aux pistes et aux baobabs du Grand Sud, les circuits présentés donnent des idées de parcours à travers l’île.',
            'Les étapes et les activités se préparent selon vos envies et restent à confirmer avant le départ, notamment en fonction des conditions de route et des disponibilités locales.',
          ],
        },
      ],
      seo: {
        metaTitle: 'À propos d’Anabo Roadtrip Madagascar',
        metaDescription:
          'Rencontrez Vonjy, guide-chauffeur à Madagascar, et découvrez des road trips et circuits sur mesure pour explorer l’île.',
        keywords: [
          'Anabo Roadtrip Madagascar',
          'guide-chauffeur Madagascar',
          'voyage sur mesure Madagascar',
          'road trip Madagascar',
          'circuit Madagascar',
        ],
      },
    },
    customTrip: {
      pageTitle: 'Voyage sur mesure à Madagascar',
      excerpt:
        'Imaginez votre circuit à Madagascar avec un chauffeur-guide, selon vos envies, vos dates et les régions à découvrir.',
      formTitle: 'Parlons de votre projet de voyage',
      formDescription:
        'Parlez-nous des dates, des lieux et du rythme souhaités : nous vous aiderons à imaginer votre circuit à Madagascar avec chauffeur-guide.',
      seo: {
        metaTitle: 'Voyage sur mesure à Madagascar',
        metaDescription:
          'Préparez un circuit sur mesure à Madagascar avec chauffeur-guide. Partagez vos dates, vos envies et les régions à découvrir.',
        keywords: [
          'voyage sur mesure Madagascar',
          'circuit personnalisé Madagascar',
          'chauffeur-guide Madagascar',
          'road trip Madagascar',
          'itinéraire Madagascar',
        ],
      },
    },
    madagascar: {
      pageTitle: 'Madagascar, l’île-continent',
      excerpt:
        'Découvrez Madagascar avec nos circuits sur mesure accompagnés par un chauffeur-guide.',
      heroTitle: 'Madagascar, l’île-continent',
      heroSubtitle:
        'Des paysages uniques, une culture riche et un peuple accueillant',
      seo: {
        metaTitle: 'Madagascar, l’île-continent',
        metaDescription:
          'Découvrez les paysages, la culture et la faune de Madagascar et préparez votre voyage avec un chauffeur-guide local.',
        keywords: [
          'voyage Madagascar',
          'découvrir Madagascar',
          'paysages de Madagascar',
          'culture malgache',
          'faune de Madagascar',
          'circuit Madagascar',
        ],
      },
    },
    guidelines: {
      seo: {
        metaTitle: 'Conseils de voyage à Madagascar',
        metaDescription:
          'Retrouvez des conseils pratiques pour préparer votre voyage à Madagascar et profiter de votre circuit dans les meilleures conditions.',
        keywords: [
          'conseils voyage Madagascar',
          'préparer voyage Madagascar',
          'informations pratiques Madagascar',
          'road trip Madagascar',
        ],
      },
    },
  },
  en: {
    about: {
      pageTitle: 'About Anabo Roadtrip Madagascar',
      excerpt:
        'Meet Vonjy, your driver-guide in Madagascar, and discover journeys shaped around the way you want to explore.',
      heroTitle: "I'm Vonjy, your driver-guide in Madagascar",
      heroSubtitle:
        'I help you discover the island on a road trip shaped around your interests.',
      sections: [
        {
          title: 'An island of many landscapes',
          paragraphs: [
            'Madagascar is an island continent with varied landscapes and cultures. From tropical forests and the Central Highlands to rocky formations, coastlines and beaches, every region reveals a different side of the island.',
            'Its distinctive nature, baobabs, lemurs and rich culture make every route a different discovery.',
          ],
          alt: 'Landscape in Madagascar',
        },
        {
          title: 'A road trip with a driver-guide',
          paragraphs: [
            'Anabo Roadtrip Madagascar offers tailor-made journeys with a driver-guide. I accompany you as you discover the country and help shape an itinerary around your interests, available time and the regions you would like to explore.',
          ],
          alt: 'Baobab in Madagascar',
        },
        {
          title: 'Routes to explore the island',
          paragraphs: [
            'From the RN7 and the south to eastern forests, the north and Nosy Be, or the tracks and baobabs of the Grand South, the circuits on this site offer ideas for exploring the island.',
            'Stops and activities are planned around your interests and confirmed before departure, taking local availability and road conditions into account.',
          ],
        },
      ],
      seo: {
        metaTitle: 'About Anabo Roadtrip Madagascar',
        metaDescription:
          'Meet Vonjy, a driver-guide in Madagascar, and explore the island on a tailor-made road trip or private circuit.',
        keywords: [
          'Anabo Roadtrip Madagascar',
          'Madagascar driver guide',
          'Madagascar tailor-made tour',
          'Madagascar road trip',
          'Madagascar private tour',
        ],
      },
    },
    customTrip: {
      pageTitle: 'Tailor-made travel in Madagascar',
      excerpt:
        'Plan a Madagascar trip with a driver-guide around your interests, travel dates and the regions you want to discover.',
      formTitle: 'Plan your tailor-made trip',
      formDescription:
        'Tell us your preferred dates, places and travel style. We can help shape a Madagascar itinerary with a driver-guide.',
      seo: {
        metaTitle: 'Tailor-made Madagascar travel',
        metaDescription:
          'Plan a tailor-made Madagascar tour with a driver-guide. Share your dates, interests and the regions you would like to explore.',
        keywords: [
          'tailor-made Madagascar tour',
          'custom Madagascar trip',
          'Madagascar driver guide',
          'Madagascar road trip',
          'Madagascar itinerary',
        ],
      },
    },
    madagascar: {
      pageTitle: 'Madagascar, the island continent',
      excerpt:
        'Discover Madagascar on a tailor-made journey with a driver-guide.',
      heroTitle: 'Madagascar, the Island Continent',
      heroSubtitle: 'Unique landscapes, a rich culture, and welcoming people',
      seo: {
        metaTitle: 'Discover Madagascar, the island continent',
        metaDescription:
          'Explore Madagascar’s landscapes, culture and wildlife, and plan your journey with a local driver-guide.',
        keywords: [
          'Madagascar travel',
          'discover Madagascar',
          'Madagascar landscapes',
          'Malagasy culture',
          'Madagascar wildlife',
          'Madagascar tour',
        ],
      },
    },
    guidelines: {
      seo: {
        metaTitle: 'Madagascar travel tips',
        metaDescription:
          'Practical advice to help you prepare for a trip to Madagascar and make the most of your journey around the island.',
        keywords: [
          'Madagascar travel tips',
          'planning a trip to Madagascar',
          'Madagascar travel information',
          'Madagascar road trip advice',
        ],
      },
    },
  },
  it: {
    about: {
      pageTitle: 'Chi siamo | Anabo Roadtrip Madagascar',
      excerpt:
        'Incontra Vonjy, il tuo autista-guida in Madagascar, e scopri itinerari pensati secondo il tuo modo di viaggiare.',
      heroTitle: 'Sono Vonjy, il vostro autista-guida in Madagascar',
      heroSubtitle:
        'Vi accompagno alla scoperta dell’isola con un road trip pensato secondo i vostri interessi.',
      sections: [
        {
          title: 'Un’isola dai mille paesaggi',
          paragraphs: [
            'Il Madagascar è un’isola-continente dai paesaggi e dalle culture diversi. Dalle foreste tropicali agli Altipiani, dalle formazioni rocciose alle coste e alle spiagge, ogni regione mostra un volto diverso dell’isola.',
            'La natura singolare, i baobab, i lemuri e la ricchezza culturale rendono ogni itinerario una scoperta diversa.',
          ],
          alt: 'Paesaggio del Madagascar',
        },
        {
          title: 'Un road trip con autista-guida',
          paragraphs: [
            'Anabo Roadtrip Madagascar propone viaggi su misura accompagnati da un autista-guida. Vi accompagno alla scoperta del Paese e vi aiuto a immaginare un itinerario in base ai vostri interessi, al tempo a disposizione e alle regioni che desiderate esplorare.',
          ],
          alt: 'Baobab del Madagascar',
        },
        {
          title: 'Itinerari per esplorare l’isola',
          paragraphs: [
            'Dalla RN7 e dal Sud alle foreste dell’Est, al Nord e a Nosy Be, fino alle piste e ai baobab del Grande Sud, i circuiti presentati offrono idee per scoprire l’isola.',
            'Tappe e attività vengono pianificate secondo i vostri interessi e confermate prima della partenza, tenendo conto delle condizioni stradali e delle disponibilità locali.',
          ],
        },
      ],
      seo: {
        metaTitle: 'Chi siamo | Anabo Roadtrip Madagascar',
        metaDescription:
          'Incontra Vonjy, autista-guida in Madagascar, e scopri l’isola con un road trip o un circuito su misura.',
        keywords: [
          'Anabo Roadtrip Madagascar',
          'autista guida Madagascar',
          'viaggio su misura Madagascar',
          'road trip Madagascar',
          'tour privato Madagascar',
        ],
      },
    },
    customTrip: {
      pageTitle: 'Viaggio su misura in Madagascar',
      excerpt:
        'Organizza il tuo viaggio in Madagascar con un autista-guida, secondo i tuoi interessi, le date e le regioni da scoprire.',
      formTitle: 'Progetta il tuo viaggio su misura',
      formDescription:
        'Indicaci date, luoghi e stile di viaggio: possiamo aiutarti a ideare un itinerario in Madagascar con autista-guida.',
      seo: {
        metaTitle: 'Viaggio su misura in Madagascar',
        metaDescription:
          'Organizza un tour su misura in Madagascar con autista-guida. Condividi date, interessi e regioni che desideri visitare.',
        keywords: [
          'viaggio su misura Madagascar',
          'tour personalizzato Madagascar',
          'autista guida Madagascar',
          'road trip Madagascar',
          'itinerario Madagascar',
        ],
      },
    },
    madagascar: {
      pageTitle: 'Madagascar, il continente insulare',
      excerpt:
        'Scopri il Madagascar con i nostri viaggi su misura accompagnati da un autista-guida.',
      heroTitle: 'Madagascar, l’isola-continente',
      heroSubtitle: 'Paesaggi unici, una cultura ricca e persone accoglienti',
      seo: {
        metaTitle: 'Madagascar, il continente insulare',
        metaDescription:
          'Scopri paesaggi, cultura e fauna del Madagascar e prepara il tuo viaggio con un autista-guida locale.',
        keywords: [
          'viaggio Madagascar',
          'scoprire Madagascar',
          'paesaggi Madagascar',
          'cultura malgascia',
          'fauna Madagascar',
          'tour Madagascar',
        ],
      },
    },
    guidelines: {
      seo: {
        metaTitle: 'Consigli di viaggio in Madagascar',
        metaDescription:
          'Consigli pratici per preparare il viaggio in Madagascar e vivere al meglio il tuo itinerario sull’isola.',
        keywords: [
          'consigli viaggio Madagascar',
          'preparare viaggio Madagascar',
          'informazioni viaggio Madagascar',
          'road trip Madagascar consigli',
        ],
      },
    },
  },
}

function portableText(paragraphs, prefix) {
  return paragraphs.map((text, index) => ({
    _key: `${prefix}-paragraph-${index + 1}`,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _key: `${prefix}-span-${index + 1}`,
        _type: 'span',
        text,
        marks: [],
      },
    ],
  }))
}

function seoWithLocale(existingSeo, seo) {
  if (seo.metaTitle.length > 60 || seo.metaDescription.length > 160) {
    throw new Error(`SEO trop long : ${seo.metaTitle}`)
  }
  return { ...existingSeo, _type: 'seoFields', ...seo }
}

function getImageReference(image, alt) {
  const assetId = image?.asset?._id || image?.asset?._ref
  if (!assetId) {
    throw new Error(`Image Sanity introuvable pour « ${alt} ».`)
  }
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: assetId },
    alt,
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN
const isApply = process.argv.includes('--apply')

if (!projectId || !dataset) {
  throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID et NEXT_PUBLIC_SANITY_DATASET doivent être configurés.')
}
if (isApply && !token) {
  throw new Error('SANITY_API_WRITE_TOKEN est requis pour écrire dans Sanity.')
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-06',
  useCdn: !isApply,
  ...(isApply ? { token } : {}),
})

const pages = await client.fetch(
  `*[_type == "page" && slug.current in ["about-us", "sur-mesure", "madagascar", "trip-guidelines"]]{
    _id, _rev, title, language, pageType, translationGroup, "slug": slug.current,
    excerpt, seo, modules[]{...}
  }`,
)
const pageByLocaleAndSlug = new Map(
  pages.map((page) => [`${page.language}:${page.slug}`, page]),
)

for (const slug of ['about-us', 'sur-mesure', 'madagascar', 'trip-guidelines']) {
  for (const locale of ['fr', 'en', 'it']) {
    if (!pageByLocaleAndSlug.has(`${locale}:${slug}`)) {
      throw new Error(`Page existante manquante dans Sanity : ${locale}/${slug}.`)
    }
  }
}

const sourceMadagascarPage = pageByLocaleAndSlug.get('fr:madagascar')
const sourceTextMedia = sourceMadagascarPage.modules.filter(
  (module) => module._type === 'textMediaBlock' && module.image?.asset,
)
if (sourceTextMedia.length < 2) {
  throw new Error('Les images de référence de la page Madagascar sont introuvables.')
}

const updates = []
for (const locale of ['fr', 'en', 'it']) {
  const localeData = translations[locale]
  const aboutPage = pageByLocaleAndSlug.get(`${locale}:about-us`)
  const oldHero = aboutPage.modules.find((module) => module._type === 'heroBlock')
  if (!oldHero?.backgroundImage?.asset) {
    throw new Error(`L’image du portrait de la page À propos (${locale}) est introuvable.`)
  }

  const aboutModules = [
    {
      ...oldHero,
      _key: oldHero._key || 'about-hero',
      title: localeData.about.heroTitle,
      subtitle: localeData.about.heroSubtitle,
      height: oldHero.height || 'standard',
      alignment: oldHero.alignment || 'center',
    },
    ...localeData.about.sections.map((section, index) => ({
      _key: `about-story-${index + 1}`,
      _type: 'textMediaBlock',
      title: section.title,
      content: portableText(section.paragraphs, `about-${locale}-${index + 1}`),
      ...(index < 2
        ? {
            image: getImageReference(
              sourceTextMedia[index].image,
              section.alt,
            ),
            imagePosition: index === 0 ? 'right' : 'left',
            imageSize: 'md',
          }
        : {}),
    })),
  ]

  const customPage = pageByLocaleAndSlug.get(`${locale}:sur-mesure`)
  const customModules = (customPage.modules || []).map((module) =>
    module._type === 'contactFormBlock'
      ? {
          ...module,
          title: localeData.customTrip.formTitle,
          description: localeData.customTrip.formDescription,
        }
      : module,
  )

  const madagascarPage = pageByLocaleAndSlug.get(`${locale}:madagascar`)
  const madagascarModules = (madagascarPage.modules || []).map((module) =>
    module._type === 'heroBlock'
      ? {
          ...module,
          title: localeData.madagascar.heroTitle,
          subtitle: localeData.madagascar.heroSubtitle,
        }
      : module,
  )

  updates.push(
    {
      page: aboutPage,
      data: {
        title: localeData.about.pageTitle,
        translationGroup: 'about-us',
        excerpt: localeData.about.excerpt,
        seo: seoWithLocale(aboutPage.seo, localeData.about.seo),
        modules: aboutModules,
      },
    },
    {
      page: customPage,
      data: {
        title: localeData.customTrip.pageTitle,
        translationGroup: 'sur-mesure',
        excerpt: localeData.customTrip.excerpt,
        seo: seoWithLocale(customPage.seo, localeData.customTrip.seo),
        modules: customModules,
      },
    },
    {
      page: madagascarPage,
      data: {
        title: localeData.madagascar.pageTitle,
        excerpt: localeData.madagascar.excerpt,
        seo: seoWithLocale(madagascarPage.seo, localeData.madagascar.seo),
        modules: madagascarModules,
      },
    },
    {
      page: pageByLocaleAndSlug.get(`${locale}:trip-guidelines`),
      data: {
        translationGroup: 'trip-guidelines',
        seo: seoWithLocale(
          pageByLocaleAndSlug.get(`${locale}:trip-guidelines`).seo,
          localeData.guidelines.seo,
        ),
      },
    },
  )
}

console.log(`Mode : ${isApply ? 'écriture Sanity' : 'simulation sans écriture'}`)
for (const { page, data } of updates) {
  console.log(`- [${page.language}] ${page.slug} : ${Object.keys(data).join(', ')}`)
}

if (!isApply) {
  console.log('\nAucun document Sanity n’a été modifié. Relancez avec --apply pour appliquer les traductions.')
} else {
  const transaction = client.transaction()
  for (const { page, data } of updates) {
    transaction.patch(page._id, (patch) =>
      patch.ifRevisionId(page._rev).set(data),
    )
  }
  const result = await transaction.commit()
  console.log(`Mise à jour terminée : ${result.results.length} page(s) modifiée(s).`)
}
