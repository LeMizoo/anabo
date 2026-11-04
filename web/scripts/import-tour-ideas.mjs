import nextEnv from '@next/env'
import { createClient } from '@sanity/client'
import { circuitTranslations, moduleLabels } from './tour-idea-translations.mjs'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const circuits = [
  {
    slug: 'sud-et-rn7',
    title: 'Madagascar Sud et le road trip RN7',
    tagline: 'Les couleurs',
    taglineSubtitle: 'Madagascar coloré',
    excerpt:
      'Un road trip entre les Hautes Terres et le sud de Madagascar, à travers villages, parcs nationaux, montagnes et plages.',
    routeStops: [
      'Antananarivo, Madagascar',
      'Antsirabe, Madagascar',
      'Ambositra, Madagascar',
      'Ranomafana National Park, Madagascar',
      'Ambalavao, Madagascar',
      'Tsaranoro Valley, Madagascar',
      'Isalo National Park, Madagascar',
      'Toliara, Madagascar',
      'Ifaty, Madagascar',
    ],
    duration: '10 jours (durée indicative du document source)',
    distance: '1 220 km',
    overview:
      'Préparez-vous à vivre la magie du sud de Madagascar en empruntant la RN7. De l’effervescence d’Antananarivo aux villages paisibles, aux montagnes, aux parcs nationaux et aux plages, cet itinéraire invite à découvrir les paysages et la culture de l’île à son rythme.',
    sections: [
      {
        title: 'La route nationale 7',
        paragraphs: [
          'La RN7 relie Antananarivo à Toliara et traverse des paysages variés : Hautes Terres, rizières, villages, forêts tropicales et régions plus arides.',
        ],
      },
      {
        title: 'Nature, rencontres et littoral',
        paragraphs: [
          'À Ranomafana, partez à la découverte de la forêt tropicale et de sa faune avec un guide local. À Isalo, explorez les canyons de grès et les oasis au fil des sentiers.',
          'La vallée de Tsaranoro et la réserve communautaire d’Anja offrent des possibilités de randonnée et d’observation de la nature. Ifaty ou Anakao peuvent prolonger le voyage par une pause balnéaire et des activités nautiques.',
        ],
      },
      {
        title: 'Une découverte à votre rythme',
        paragraphs: [
          'Le circuit met l’accent sur la nature, les paysages, la randonnée et les rencontres avec les communautés Betsileo, Bara et Vezo. Les étapes et la durée sont à confirmer selon les disponibilités et les conditions de route.',
        ],
      },
    ],
    highlights: [
      'Traversée panoramique de la RN7',
      'Parcs nationaux de Ranomafana et d’Isalo',
      'Vallée de Tsaranoro et réserve d’Anja',
      'Marchés et villages des Hautes Terres',
      'Extension possible vers Ifaty ou Anakao',
    ],
    days: [
      ['Jour 1 — Antananarivo à Antsirabe', 'Environ 160 km et 4 à 5 heures de route selon les conditions. Découverte des paysages des Hautes Terres et arrêt possible à Antsirabe.'],
      ['Jour 2 — Antsirabe à Ambositra', 'Continuation sur la RN7 à travers les Hautes Terres.'],
      ['Jour 3 — Ambositra à Ranomafana', 'Route vers la forêt tropicale de Ranomafana.'],
      ['Jour 4 — Ranomafana', 'Journée de découverte du parc national avec un guide local.'],
      ['Jour 5 — Ranomafana à Tsaranoro', 'Traversée des paysages du sud vers la vallée de Tsaranoro.'],
      ['Jour 6 — Vallée de Tsaranoro', 'Journée consacrée à la découverte de la vallée et à la randonnée.'],
      ['Jour 7 — Tsaranoro à Isalo', 'Route vers les paysages de grès du parc national d’Isalo.'],
      ['Jour 8 — Isalo', 'Journée de visite et de randonnée dans le parc national.'],
      ['Jour 9 — Isalo à Ifaty ou Anakao', 'Continuation vers la côte sud-ouest; le choix entre Ifaty et Anakao est à confirmer.'],
      ['Jour 10 — Ifaty', 'Temps libre et activités balnéaires selon les envies. Le document source mentionne aussi le retour vers Antananarivo par avion; transport et durée sont à confirmer.'],
    ],
  },
  {
    slug: 'baobab-et-tsingy',
    title: 'Circuit Baobab et Tsingy',
    tagline: 'L’authentique',
    excerpt:
      'Explorez le sud-ouest de Madagascar, la région de Morondava, la rivière Tsiribihina, les Tsingy et l’Allée des Baobabs.',
    routeStops: [
      'Antananarivo, Madagascar',
      'Antsirabe, Madagascar',
      'Miandrivazo, Madagascar',
      'Morondava, Madagascar',
      'Avenue of the Baobabs, Madagascar',
      'Bekopaka, Madagascar',
    ],
    duration: 'À confirmer',
    overview:
      'Cette proposition rassemble les paysages emblématiques du sud-ouest : l’Allée des Baobabs, la région de Morondava, la rivière Tsiribihina et les Tsingy de Bemaraha. Les étapes et la durée restent à confirmer.',
    sections: [
      {
        title: 'L’Allée des Baobabs',
        paragraphs: [
          'Découvrez cette piste bordée de baobabs majestueux, particulièrement remarquable au lever et au coucher du soleil.',
        ],
      },
      {
        title: 'La rivière Tsiribihina',
        paragraphs: [
          'Une descente de la rivière peut permettre d’explorer des paysages isolés, de camper en pleine nature et de découvrir la vie locale. Cette activité dépend de l’organisation et des conditions du séjour.',
        ],
      },
      {
        title: 'Les Tsingy de Bemaraha',
        paragraphs: [
          'Le parc présente des formations calcaires spectaculaires, des canyons et des sentiers de découverte. Les visites et accès sont à organiser selon les conditions locales.',
        ],
      },
    ],
    highlights: [
      'Allée des Baobabs',
      'Région de Morondava',
      'Rivière Tsiribihina',
      'Tsingy de Bemaraha',
    ],
    days: [
      ['Parcours indicatif', 'Antananarivo, Antsirabe, Miandrivazo, Morondava et Bekopaka. Cet ordre est une proposition de travail dérivée des informations du fichier source; il doit être confirmé avant publication commerciale.'],
    ],
    draft: true,
  },
  {
    slug: 'circuit-nord-et-nosibe',
    title: 'Expédition du Nord et Nosibe',
    tagline: 'Le Paradis',
    taglineSubtitle: 'La magnifique Madagascar',
    excerpt:
      'Un grand voyage du nord de Madagascar jusqu’à Nosy Be, entre parcs, paysages de l’extrême nord, rencontres et plages.',
    routeStops: [
      'Antananarivo, Madagascar',
      'Ankarafantsika National Park, Madagascar',
      'Mahajanga, Madagascar',
      'Antsohihy, Madagascar',
      'Ambanja, Madagascar',
      'Ambilobe, Madagascar',
      'Daraina, Madagascar',
      'Sambava, Madagascar',
      'Marojejy National Park, Madagascar',
      'Ankarana National Park, Madagascar',
      'Antsiranana, Madagascar',
      'Hell-Ville, Nosy Be, Madagascar',
    ],
    duration: '19 jours (durée indicative du document source)',
    distance: '1 700 km (estimation du document source)',
    overview:
      'Vivez une expérience mêlant aventure, faune, culture et détente à travers le nord de Madagascar, avant de rejoindre Nosy Be et son archipel. Le document source décrit un départ d’Antananarivo et une arrivée dans la région de Nosy Be.',
    sections: [
      {
        title: 'Parcs et paysages du nord',
        paragraphs: [
          'Le parcours mentionne Ankarafantsika, Anjohibe, Daraina, Marojejy, Ankarana et la Montagne d’Ambre. Chaque étape doit être adaptée au temps de route et aux conditions d’accès.',
          'Les Tsingy rouges, les Trois Baies et la Mer d’Émeraude sont également cités parmi les sites à découvrir autour d’Antsiranana.',
        ],
      },
      {
        title: 'Fin de voyage à Nosy Be',
        paragraphs: [
          'Le circuit se prolonge vers Nosy Be, Hell-Ville et les îles de l’archipel. Des sorties en mer et des activités balnéaires peuvent être envisagées selon la saison et les disponibilités.',
        ],
      },
    ],
    highlights: [
      'Parcs nationaux d’Ankarafantsika, Marojejy, Ankarana et Montagne d’Ambre',
      'Tsingy rouges et Trois Baies',
      'Réserve de Daraina et région de Sambava',
      'Nosy Be et son archipel',
    ],
    days: [
      ['Départ vers Ankarafantsika', 'Le document source indique un premier trajet d’environ 400 km et 9 heures. Cette durée est indicative et doit être vérifiée avant le départ.'],
      ['Étapes du nord', 'Anjohibe, Mahajanga, Antsohihy, Ambanja, Daraina, Sambava, Marojejy, Ambilobe, Ankarana et Antsiranana figurent dans le programme source.'],
      ['Arrivée à Nosy Be', 'Le circuit demandé relie Antananarivo à Nosy Be / Hell-Ville. Le transfert final et le nombre de nuits sur l’île sont à confirmer.'],
    ],
  },
  {
    slug: 'circuit-safari-en-voiture',
    title: 'Circuit safari en voiture',
    tagline: 'L’exceptionnel',
    taglineSubtitle: 'Madagascar, un lieu unique',
    excerpt:
      'Une découverte de la faune et de la flore malgaches à travers les parcs nationaux et les réserves de plusieurs régions de l’île.',
    routeStops: [
      'Antananarivo, Madagascar',
      'Andasibe-Mantadia National Park, Madagascar',
      'Antananarivo, Madagascar',
      'Ankarafantsika National Park, Madagascar',
      'Antananarivo, Madagascar',
      'Antsirabe, Madagascar',
      'Ranomafana National Park, Madagascar',
      'Ambalavao, Madagascar',
      'Isalo National Park, Madagascar',
      'Ifaty, Madagascar',
      'Antananarivo, Madagascar',
    ],
    duration: '18 jours (durée indicative du document source)',
    distance: '1 980 km (estimation du document source)',
    overview:
      'Madagascar abrite une biodiversité remarquable. Ce circuit propose d’explorer plusieurs parcs et réserves pour observer la faune et la flore dans leurs habitats naturels, tout en découvrant les paysages et les modes de vie locaux.',
    sections: [
      {
        title: 'Forêts et faune endémique',
        paragraphs: [
          'Le programme cite Andasibe, Mantadia, Analamazaotra et Maromizaha, puis Ankarafantsika. Les observations d’animaux ne sont jamais garanties et se font dans le respect des sites.',
        ],
      },
      {
        title: 'Du centre au sud',
        paragraphs: [
          'Le parcours se poursuit par Antsirabe, Ranomafana, Ambalavao et Isalo, avec une extension possible vers Ifaty. Les étapes associent forêts humides, paysages des Hautes Terres et régions plus sèches.',
        ],
      },
    ],
    highlights: [
      'Parcs d’Andasibe, Mantadia et Analamazaotra',
      'Réserve de Maromizaha',
      'Parc national d’Ankarafantsika',
      'Ranomafana, Isalo et réserve d’Anja',
      'Forêts, baobabs et observation de la faune',
    ],
    days: [
      ['Jour 1 — Antananarivo', 'Accueil et réunion d’information avec le représentant d’Anabo Tours.'],
      ['Jours 2 à 6 — Andasibe', 'Découverte de la région d’Andasibe et retour vers Antananarivo.'],
      ['Étapes suivantes', 'Le programme source poursuit vers Ankarafantsika, Antsirabe, Ranomafana, Ambalavao, Isalo et Ifaty. Le détail jour par jour est à confirmer, car les étapes du document source comportent des incohérences.'],
    ],
  },
  {
    slug: 'cote-est-et-lemuriens',
    title: 'Voyage sur la côte est de Madagascar',
    tagline: 'L’Evergreen',
    taglineSubtitle: 'Nature et aventure',
    excerpt:
      'Un circuit d’Antananarivo à Sainte-Marie à travers la forêt d’Andasibe, le canal de Pangalanes et les paysages de la côte est.',
    routeStops: [
      'Antananarivo, Madagascar',
      'Andasibe-Mantadia National Park, Madagascar',
      'Manambato, Madagascar',
      'Akanin’ny Nofy, Madagascar',
      'Toamasina, Madagascar',
      'Mahambo, Madagascar',
      'Sainte-Marie, Madagascar',
    ],
    duration: '10 jours (durée indicative du document source)',
    distance: '600 km (estimation du document source)',
    overview:
      'D’Antananarivo à Sainte-Marie, ce road trip associe forêt tropicale, faune endémique, navigation sur le canal de Pangalanes et détente sur la côte est.',
    sections: [
      {
        title: 'Andasibe et sa forêt tropicale',
        paragraphs: [
          'La première étape est la région d’Andasibe, connue pour ses forêts et ses parcs. Une promenade accompagnée d’un guide permet de découvrir la faune et la flore locales, y compris lors d’une sortie nocturne si les conditions le permettent.',
        ],
      },
      {
        title: 'Le canal de Pangalanes et le Palmarium',
        paragraphs: [
          'Depuis Manambato, le parcours rejoint le canal de Pangalanes, un réseau de lacs et de canaux utilisé par les communautés locales. Le Palmarium permet de découvrir une réserve privée et ses espèces dans le cadre d’une visite organisée.',
        ],
      },
      {
        title: 'Sainte-Marie',
        paragraphs: [
          'Le voyage se termine sur l’île Sainte-Marie. Plages, sorties en mer et observation des baleines en saison peuvent être envisagées, sous réserve des conditions et des prestataires disponibles.',
        ],
      },
    ],
    highlights: [
      'Parcs nationaux d’Andasibe',
      'Indri et faune de la forêt tropicale',
      'Canal de Pangalanes et réserve du Palmarium',
      'Mahambo et île Sainte-Marie',
      'Activités nautiques et observation des baleines en saison',
    ],
    days: [
      ['Jour 1 — Antananarivo à Andasibe', 'Accueil à l’aéroport puis transfert à l’hôtel ou départ vers Andasibe selon l’horaire d’arrivée.'],
      ['Jours 2 et 3 — Andasibe', 'Découverte des parcs et de la forêt avec un guide local.'],
      ['Jour 4 — Andasibe à Manambato', 'Route vers la côte est, puis transfert en bateau sur le canal.'],
      ['Jours 5 et 6 — Palmarium', 'Visites et temps de découverte dans la réserve.'],
      ['Jours 7 à 10 — Mahambo et Sainte-Marie', 'Transferts côtiers puis séjour à Sainte-Marie. Le retour et les transferts sont à confirmer : le document source compte deux fois le jour 10.'],
    ],
  },
  {
    slug: 'lemuriens-et-circuit-vers-l-est',
    title: 'Lémuriens et circuit vers l’est',
    tagline: 'Le merveilleux',
    excerpt:
      'Un itinéraire centré sur Andasibe et la forêt tropicale, habitat de lémuriens, de caméléons et de plantes endémiques.',
    routeStops: [
      'Antananarivo, Madagascar',
      'Andasibe-Mantadia National Park, Madagascar',
      'Analamazaotra, Madagascar',
      'Antananarivo, Madagascar',
    ],
    duration: 'À confirmer',
    overview:
      'Cette proposition met en valeur le parc national d’Andasibe et la forêt tropicale de l’est, où vivent des espèces endémiques. Elle s’adresse aux voyageurs intéressés par la nature, les balades en forêt et la découverte de la faune.',
    sections: [
      {
        title: 'Explorer la forêt d’Andasibe',
        paragraphs: [
          'Le document source présente Andasibe comme le cœur de ce circuit. Des visites accompagnées peuvent être organisées dans les parcs et réserves de la région, selon les horaires, les conditions locales et les disponibilités.',
        ],
      },
      {
        title: 'Prolonger vers la côte est',
        paragraphs: [
          'Une extension vers Manambato, le canal de Pangalanes ou Toamasina peut être envisagée pour ajouter une étape côtière. Cette extension est une suggestion à valider et non un programme confirmé.',
        ],
      },
    ],
    highlights: [
      'Parc national d’Andasibe',
      'Observation de la faune avec un guide local',
      'Forêt tropicale et flore endémique',
      'Extension possible vers le canal de Pangalanes',
    ],
    days: [
      ['Parcours proposé à confirmer', 'Antananarivo, Andasibe et retour à Antananarivo. La durée, les nuits sur place et toute extension vers la côte est restent à définir avec l’équipe.'],
    ],
    draft: true,
  },
  {
    slug: 'train-manakara',
    title: 'Train Manakara',
    tagline: 'Le vintage culturel',
    excerpt:
      'Un voyage culturel et d’aventure de Fianarantsoa à Manakara, à travers les paysages luxuriants de la côte est.',
    routeStops: [
      'Fianarantsoa, Madagascar',
      'Manakara, Madagascar',
    ],
    duration: 'À confirmer',
    overview:
      'Ce voyage ferroviaire relie Fianarantsoa à Manakara et traverse des paysages de l’est de Madagascar. Il offre une occasion de rencontrer les habitants et de découvrir leur quotidien.',
    sections: [
      {
        title: 'Une expérience ferroviaire et culturelle',
        paragraphs: [
          'Le trajet en train constitue le cœur de cette proposition. Les horaires, jours de circulation et conditions d’exploitation peuvent varier; ils doivent être confirmés avant de fixer le programme.',
          'Le séjour peut être complété par des étapes à Fianarantsoa et à Manakara, selon le temps disponible.',
        ],
      },
    ],
    highlights: [
      'Ligne ferroviaire Fianarantsoa–Manakara',
      'Paysages de la côte est',
      'Rencontres et découverte de la vie locale',
    ],
    days: [
      ['Parcours proposé à confirmer', 'Fianarantsoa, trajet ferroviaire jusqu’à Manakara, puis séjour ou transfert retour à organiser selon les horaires disponibles.'],
    ],
    draft: true,
  },
  {
    slug: 'voyage-hors-route-et-baobabs',
    title: 'Le road trip du Grand Sud — Tsingy, Baobabs et RN7',
    tagline: 'L’unique',
    taglineSubtitle: 'Le road trip du Grand Sud · Tsingy, Baobabs & RN7',
    excerpt:
      'Une grande aventure entre la rivière Tsiribihina, les Tsingy de Bemaraha, la côte sud-ouest, les baobabs et la RN7.',
    routeStops: [
      'Antananarivo, Madagascar',
      'Antsirabe, Madagascar',
      'Miandrivazo, Madagascar',
      'Masiakampy, Madagascar',
      'Bekopaka, Madagascar',
      'Morondava, Madagascar',
      'Belo sur Mer, Madagascar',
      'Manja, Madagascar',
      'Andavadaoka, Madagascar',
      'Ambatomilo, Madagascar',
      'Ifaty, Madagascar',
      'Ranohira, Madagascar',
      'Tsaranoro Valley, Madagascar',
      'Ranomafana National Park, Madagascar',
      'Ambositra, Madagascar',
      'Antananarivo, Madagascar',
    ],
    duration: '21 jours (durée indicative du document source)',
    distance: '1 990 km (estimation du document source)',
    overview:
      'Communément appelé le Grand Sud dans le document source, ce circuit combine la rivière Tsiribihina, les Tsingy de Bemaraha, l’Allée des Baobabs, la côte sud-ouest et plusieurs étapes de la RN7.',
    sections: [
      {
        title: 'Baobabs, rivière et Tsingy',
        paragraphs: [
          'À Morondava, l’Allée des Baobabs offre un paysage remarquable au lever et au coucher du soleil. La descente de la Tsiribihina et la visite de Bekopaka et des Tsingy peuvent être intégrées au parcours selon les conditions d’accès et l’organisation locale.',
        ],
      },
      {
        title: 'La côte sud-ouest et les Hautes Terres',
        paragraphs: [
          'Le parcours décrit une aventure hors route entre Morondava, Belo sur Mer, Manja, Andavadaoka et Ifaty, avant de rejoindre Ranohira, Tsaranoro, Ranomafana, Ambositra et Antananarivo.',
          'Les pistes côtières et les traversées de rivière dépendent de la saison. Le trajet doit être confirmé avec l’équipe avant réservation.',
        ],
      },
    ],
    highlights: [
      'Descente de la rivière Tsiribihina',
      'Tsingy de Bemaraha',
      'Allée des Baobabs et forêt de Kirindy',
      'Pistes côtières de Belo sur Mer à Ifaty',
      'Isalo, Tsaranoro et Ranomafana',
    ],
    days: [
      ['Jour 1 — Antananarivo à Antsirabe', 'Le document source indique environ 160 km et 4 heures de route.'],
      ['Étapes suivantes', 'Le programme source mentionne Miandrivazo, la Tsiribihina, Bekopaka, Morondava, Belo sur Mer, Manja, Andavadaoka, Ifaty, Ranohira, Tsaranoro, Ambalavao, Ranomafana, Ambositra et Antananarivo.'],
      ['À confirmer avant départ', 'Le programme source contient des numéros de jours répétés et des étapes dont l’ordre doit être vérifié. La durée, les traversées et les conditions des pistes sont à valider.'],
    ],
  },
  {
    slug: 'ampefy-et-la-campagne',
    title: 'Ampéfy et la campagne',
    tagline: 'Lacs et chutes d’eau',
    taglineSubtitle: 'Les Hautes Terres de Madagascar',
    excerpt:
      'Une escapade depuis Antananarivo vers le lac Itasy, la cascade Lily, les geysers d’Analavory et la campagne Merina.',
    routeStops: [
      'Antananarivo, Madagascar',
      'Ampefy, Madagascar',
      'Analavory, Madagascar',
      'Antananarivo, Madagascar',
    ],
    duration: '4 jours annoncés; programme détaillé à confirmer',
    distance: '260 km (estimation du document source)',
    overview:
      'À environ deux heures de la capitale selon les conditions, Ampefy offre une escapade au calme, à la découverte du lac Itasy, de la cascade Lily, des geysers d’Analavory et du quotidien des communautés Merina.',
    sections: [
      {
        title: 'Lac Itasy, cascade Lily et geysers',
        paragraphs: [
          'Le programme propose de découvrir les paysages de la région d’Itasy, de profiter d’un temps de détente près du lac et de visiter la cascade Lily. Les geysers d’Analavory et les marchés locaux peuvent compléter l’excursion.',
        ],
      },
      {
        title: 'Campagne et vie locale',
        paragraphs: [
          'Le séjour privilégie les balades, les paysages et la photographie, avec des temps libres pour profiter de la campagne et des villages.',
        ],
      },
    ],
    highlights: [
      'Lac Itasy',
      'Cascade Lily',
      'Geysers d’Analavory',
      'Marchés et vie quotidienne locale',
    ],
    days: [
      ['Jour 1 — Antananarivo à Ampefy', 'Départ le matin, route vers la région d’Itasy, installation à l’hôtel et temps libre.'],
      ['Jours 2 à 4 — Région d’Ampefy', 'Découverte des environs, de la cascade Lily, du lac et des geysers selon le rythme du séjour.'],
      ['Retour', 'Le fichier mentionne aussi une cinquième journée pour le trajet Ampefy–Antananarivo. La durée exacte est à confirmer.'],
    ],
  },
]

function portableText(paragraphs) {
  return paragraphs
    .map((paragraph) => ({
      text: typeof paragraph === 'string' ? paragraph : paragraph.text,
      style: typeof paragraph === 'string' ? 'normal' : paragraph.style || 'normal',
    }))
    .filter(({ text }) => typeof text === 'string' && text.trim())
    .map(({ text, style }, index) => ({
      _key: `paragraph-${index + 1}`,
      _type: 'block',
      style,
      markDefs: [],
      children: [{
        _key: `span-${index + 1}`,
        _type: 'span',
        text: text.trim(),
        marks: [],
      }],
    }))
}

function localizeCircuit(circuit, locale) {
  if (locale === 'fr') return circuit

  const translation = circuitTranslations[locale]?.[circuit.slug]
  if (!translation) {
    throw new Error(`Traduction ${locale} manquante pour le circuit ${circuit.slug}.`)
  }
  if (
    !translation.title ||
    !translation.tagline ||
    !translation.excerpt ||
    !translation.duration ||
    !translation.overview ||
    (circuit.distance && !translation.distance) ||
    translation.sections?.length !== circuit.sections.length ||
    translation.days?.length !== circuit.days.length ||
    translation.sections.some(
      (section, index) =>
        !section.title ||
        section.paragraphs?.length !== circuit.sections[index].paragraphs.length
    ) ||
    translation.days.some(([title, description]) => !title || !description)
  ) {
    throw new Error(`Traduction ${locale} incomplète ou de structure incorrecte pour ${circuit.slug}.`)
  }

  return { ...circuit, ...translation }
}

function toModules(circuit, locale) {
  const prefix = 'tour-import'
  const labels = moduleLabels[locale]
  const modules = [
    {
      _key: `${prefix}-hero`,
      _type: 'heroBlock',
      title: circuit.title,
      subtitle: circuit.excerpt,
      height: 'compact',
      overlay: true,
      overlayOpacity: 45,
      alignment: 'center',
    },
    {
      _key: `${prefix}-tagline`,
      _type: 'headingBlock',
      title: circuit.tagline,
      subtitle: circuit.taglineSubtitle,
      titleFont: 'font-serif',
      titleColor: 'gold',
      titleSize: 'xl',
      titleWeight: 'font-bold',
      subtitleFont: 'font-sans',
      subtitleColor: 'navy',
      subtitleSize: 'md',
      subtitleWeight: 'font-medium',
      alignment: 'center',
    },
    {
      _key: `${prefix}-overview`,
      _type: 'textMediaBlock',
      title: labels.overview,
      content: portableText([circuit.overview]),
      imagePosition: 'right',
      imageSize: 'lg',
    },
  ]

  if (circuit.draft) {
    modules.push({
      _key: `${prefix}-draft-note`,
      _type: 'textMediaBlock',
      title: labels.draftTitle,
      content: portableText([labels.draftNote]),
      imagePosition: 'right',
      imageSize: 'lg',
    })
  }

  modules.push(
    ...circuit.sections.map((section, index) => ({
      _key: `${prefix}-section-${index + 1}`,
      _type: 'textMediaBlock',
      title: section.title,
      content: portableText(section.paragraphs),
      imagePosition: 'right',
      imageSize: 'lg',
    })),
    {
      _key: `${prefix}-highlights`,
      _type: 'textMediaBlock',
      title: labels.highlights,
      content: portableText(circuit.highlights.map((item) => `• ${item}`)),
      imagePosition: 'right',
      imageSize: 'lg',
    },
    {
      _key: `${prefix}-itinerary`,
      _type: 'textMediaBlock',
      title: labels.itinerary,
      content: portableText([
        `${labels.stops} : ${circuit.routeStops.map((stop) => stop.replace(/, Madagascar$/, '')).join(' – ')}`,
        `${labels.duration} : ${circuit.duration}`,
        ...(circuit.distance ? [`${labels.estimatedDistance} : ${circuit.distance}`] : []),
      ]),
      imagePosition: 'right',
      imageSize: 'lg',
    },
    {
      _key: `${prefix}-program`,
      _type: 'textMediaBlock',
      title: labels.program,
      content: portableText(
        circuit.days.flatMap(([title, description]) => [
          { text: title, style: 'h3' },
          description,
        ]),
      ),
      imagePosition: 'right',
      imageSize: 'lg',
    },
  )

  return modules
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-06'
const isApply = process.argv.includes('--apply')
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset) {
  throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID et NEXT_PUBLIC_SANITY_DATASET doivent être configurés.')
}

if (isApply && !token) {
  throw new Error(
    'SANITY_API_WRITE_TOKEN est requis. Configurez-le localement dans web/.env.local, sans le partager dans le chat.',
  )
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: !isApply,
  ...(isApply ? { token } : {}),
})

const pages = await client.fetch(
  `*[_type == "page" && language in ["fr", "en", "it"] && slug.current in $slugs]{
    _id, _rev, title, "slug": slug.current, language, pageType, translationGroup,
    excerpt, routeStops, featuredImage, seo, modules[]{...}
  }`,
  { slugs: circuits.map((circuit) => circuit.slug) },
)

const pageByLocaleSlug = new Map(pages.map((page) => [`${page.language}:${page.slug}`, page]))
const missingFrench = circuits.filter((circuit) => !pageByLocaleSlug.has(`fr:${circuit.slug}`))

if (missingFrench.length) {
  throw new Error(`Pages françaises manquantes dans Sanity : ${missingFrench.map((page) => page.slug).join(', ')}`)
}

const updates = circuits.flatMap((circuit) =>
  ['fr', 'en', 'it'].map((locale) => {
    const sourcePage = pageByLocaleSlug.get(`fr:${circuit.slug}`)
    const page = pageByLocaleSlug.get(`${locale}:${circuit.slug}`)
    const localizedCircuit = localizeCircuit(circuit, locale)
    const translationGroup = sourcePage.translationGroup || circuit.slug
    return {
      circuit,
      locale,
      page,
      sourcePage,
      localizedCircuit,
      translationGroup,
      modules: toModules(localizedCircuit, locale),
    }
  }),
)
const missingPageIds = updates
  .filter(({ page }) => !page)
  .map(({ circuit, locale }) => `tour-import-${locale}-${circuit.slug}`)
const existingNewIds = missingPageIds.length
  ? await client.fetch('*[_id in $ids]._id', { ids: missingPageIds })
  : []

if (existingNewIds.length) {
  throw new Error(`Identifiants Sanity déjà utilisés : ${existingNewIds.join(', ')}`)
}

console.log(`Mode : ${isApply ? 'écriture Sanity' : 'simulation sans écriture'}`)
for (const update of updates) {
  const { circuit, locale, page, localizedCircuit, modules } = update
  console.log(
    `- [${locale}] ${localizedCircuit.title} (${circuit.slug}) : ${page ? `${page.modules?.length ?? 0} bloc(s) existant(s)` : 'page à créer'}, ${modules.length} bloc(s) à importer${circuit.draft ? ' — programme provisoire à confirmer' : ''}`,
  )
}

if (!isApply) {
  console.log('\nAucun document Sanity n’a été modifié. Relancez avec --apply pour importer les 27 versions linguistiques.')
} else {
  const transaction = client.transaction()

  for (const update of updates) {
    const { circuit, locale, page, sourcePage, localizedCircuit, translationGroup, modules } = update
    const existingModules = page?.modules ?? []
    const preservedModules = existingModules.filter(
      (module) => !module._key?.startsWith('tour-import-'),
    )
    const localizedSeo = {
      ...(page?.seo ?? {}),
      metaTitle: localizedCircuit.title.slice(0, 60),
      metaDescription: localizedCircuit.excerpt.slice(0, 160),
    }

    if (page) {
      transaction.patch(page._id, (patch) =>
        patch
          .ifRevisionId(page._rev)
          .set({
            ...(locale === 'fr' ? {} : { title: localizedCircuit.title }),
            translationGroup,
            excerpt: localizedCircuit.excerpt,
            routeStops: circuit.routeStops,
            seo: localizedSeo,
            modules: [...modules, ...preservedModules],
          }),
      )
    } else {
      const newId = `tour-import-${locale}-${circuit.slug}`
      transaction.create({
        _id: newId,
        _type: 'page',
        title: localizedCircuit.title,
        slug: { current: circuit.slug },
        language: locale,
        translationGroup,
        pageType: sourcePage.pageType || 'circuit',
        ...(sourcePage.featuredImage ? { featuredImage: sourcePage.featuredImage } : {}),
        excerpt: localizedCircuit.excerpt,
        routeStops: circuit.routeStops,
        seo: localizedSeo,
        modules: [...modules, ...preservedModules],
      })
    }
  }

  const result = await transaction.commit()
  console.log(`Import terminé : ${result.results.length} version(s) linguistique(s) mise(s) à jour ou créée(s).`)
}
