import nextEnv from '@next/env'
import { createClient } from '@sanity/client'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const content = {
  fr: {
    about: {
      title: 'À propos | Anabo Roadtrip Madagascar',
      excerpt:
        'Rencontrez Vonjy, votre chauffeur-guide à Madagascar, et découvrez les valeurs d’Anabo Roadtrip Madagascar.',
      hero: 'Je suis Vonjy',
      heroSubtitle: 'Votre chauffeur-guide à Madagascar',
      philosophy: 'Voyager avec le cœur, choisir un mode de vie durable',
      welcome: [
        'Salama et bienvenue ! Je suis Vonjy. Je vous accompagne sur les routes de Madagascar pour vous aider à découvrir le pays, ses paysages et ses habitants.',
        'Chaque voyage est l’occasion de faire de belles rencontres et de soutenir les personnes et les communautés qui font vivre les régions traversées.',
      ],
      commitments: [
        {
          title: 'Connaissances locales',
          items: [
            {
              label: 'Normes culturelles',
              text: 'La connaissance des coutumes locales aide à éviter les malentendus et à favoriser des échanges respectueux avec les habitants.',
            },
            {
              label: 'Itinéraires adaptés',
              text: 'Nous préparons le parcours en tenant compte des routes, de la météo, des conditions locales et des étapes souhaitées.',
            },
            {
              label: 'Préparation du voyage',
              text: 'Les conditions pouvant évoluer, l’itinéraire est ajusté en fonction des informations disponibles et des recommandations locales.',
            },
          ],
        },
        {
          title: 'Transport fiable',
          items: [
            {
              label: 'Véhicules entretenus',
              text: 'Les véhicules sont suivis et entretenus par leurs propriétaires afin de préparer les trajets dans de bonnes conditions.',
            },
            {
              label: 'Chauffeurs expérimentés',
              text: 'Les chauffeurs connaissent les réalités de la conduite à Madagascar et adaptent leur conduite aux routes et aux conditions du moment.',
            },
            {
              label: 'Sécurité à bord',
              text: 'Les consignes et les équipements de sécurité du véhicule sont vérifiés avant le départ.',
            },
          ],
        },
        {
          title: 'Liens avec les communautés',
          items: [
            {
              label: 'Connaissances locales',
              text: 'La connaissance du pays et de ses régions favorise les rencontres et donne du contexte aux découvertes du voyage.',
            },
            {
              label: 'Interactions respectueuses',
              text: 'Nous encourageons des échanges respectueux des personnes, des coutumes et des lieux visités.',
            },
          ],
        },
        {
          title: 'Une équipe de confiance',
          items: [
            {
              label: 'Partenaires locaux',
              text: 'Selon les étapes, le voyage peut réunir chauffeurs, propriétaires de véhicules, guides locaux, hébergeurs et porteurs.',
            },
            {
              label: 'Expérience du terrain',
              text: 'La préparation s’appuie sur la connaissance des régions et sur les informations des partenaires locaux.',
            },
            {
              label: 'Langues',
              text: 'Le malgache est notre langue officielle. Selon les personnes et les régions, des partenaires parlent aussi français ou anglais.',
            },
          ],
        },
      ],
      local: [
        'Privilégier les acteurs locaux permet de soutenir les communautés, les entreprises et les artisans. Cet engagement ne se limite pas à l’achat de souvenirs : un repas préparé localement, la visite d’une réserve villageoise ou les services d’un guide contribuent aussi à l’économie des régions.',
        'Les entreprises locales sont au cœur du voyage : location de véhicules, transferts en bateau ou en pirogue, hébergements et activités. Nous cherchons à faire en sorte que les dépenses du séjour bénéficient aux personnes qui vous accueillent.',
      ],
      sustainable: [
        'Nous souhaitons contribuer à un tourisme attentif aux communautés, à la culture et à l’environnement de Madagascar.',
        'La protection des milieux naturels et les besoins quotidiens des habitants doivent être considérés ensemble. Nous cherchons à faire des choix responsables et à limiter notre impact pendant le voyage.',
      ],
      faqTitle: 'Questions pour préparer un voyage avec un chauffeur-guide',
      faqs: [
        ['Pourquoi voyager avec un chauffeur-guide à Madagascar ?', 'Un chauffeur-guide connaît les routes et les réalités locales. Il peut vous accompagner dans vos déplacements et vous aider à adapter le parcours aux conditions rencontrées.'],
        ['Les circuits peuvent-ils être personnalisés ?', 'Oui. Les régions, les étapes et le rythme peuvent être discutés selon vos envies, vos dates et les conditions de voyage. Les prestations sont à confirmer avant réservation.'],
        ['Comment un voyage peut-il soutenir les communautés locales ?', 'En faisant appel à des guides, hébergements, transporteurs, artisans et prestataires locaux lors des étapes du voyage.'],
      ],
      seo: {
        title: 'À propos | Anabo Roadtrip Madagascar',
        description:
          'Rencontrez Vonjy, chauffeur-guide à Madagascar, et découvrez les engagements locaux et les voyages sur mesure d’Anabo Roadtrip.',
        keywords: ['Anabo Roadtrip Madagascar', 'chauffeur-guide Madagascar', 'voyage sur mesure Madagascar', 'tourisme local Madagascar', 'road trip Madagascar'],
      },
    },
    guidelines: {
      title: 'Conseils de voyage à Madagascar',
      excerpt:
        'Conseils pratiques pour préparer votre voyage à Madagascar : culture, santé, sécurité, monnaie et climat.',
      hero: 'Conseils pour une aventure inoubliable à Madagascar',
      intro:
        'Salut, amis voyageurs ! Madagascar offre des paysages remarquables, une faune singulière et une culture riche. Pour préparer votre séjour, voici des repères généraux issus de l’expérience locale. Les conditions et les recommandations officielles peuvent évoluer : vérifiez les informations à jour avant le départ.',
      sections: [
        {
          title: 'Étiquette culturelle et rencontres',
          paragraphs: [
            'Un « Salama » accompagné d’un sourire est une façon chaleureuse de commencer un échange. Saluez les personnes avant de poser vos questions et dites « Misaotra » pour remercier.',
            'Le malgache est la langue nationale ; le français est aussi parlé dans de nombreux contextes, notamment en ville. Apprendre quelques mots de malgache peut faciliter les rencontres.',
            'Renseignez-vous sur les coutumes locales, suivez les consignes dans les lieux sacrés et adoptez une tenue adaptée, en particulier dans les villages ou les sites religieux. Demandez toujours l’autorisation avant de photographier une personne ou ses biens.',
            'La patience et la souplesse sont utiles. « Moramora » rappelle qu’il faut parfois prendre le temps et s’adapter au rythme local.',
          ],
        },
        {
          title: 'Santé et préparation',
          paragraphs: [
            'Ces informations sont générales et ne remplacent pas un avis médical. Consultez un professionnel de santé ou une clinique de médecine des voyages suffisamment tôt pour obtenir des recommandations adaptées à votre itinéraire et à votre situation.',
            'Vérifiez que vos vaccinations de routine sont à jour et demandez conseil au sujet des vaccins ou traitements préventifs éventuellement recommandés. Les exigences relatives à la fièvre jaune dépendent notamment de votre provenance et des règles en vigueur : consultez les sources officielles.',
            'Le risque de maladies transmises par les moustiques varie selon les régions et les saisons. Demandez conseil à un professionnel de santé et suivez ses recommandations concernant la prévention, les répulsifs, les vêtements couvrants et les moustiquaires.',
            'Pour l’eau et l’alimentation, choisissez des options sûres, lavez-vous régulièrement les mains et prenez des précautions avec les aliments crus. Prévoyez vos médicaments personnels en quantité suffisante, leur ordonnance et une assurance voyage couvrant les soins et, si nécessaire, l’évacuation médicale.',
            'Les infrastructures de santé peuvent être limitées en dehors des grandes villes. Protégez-vous du soleil, hydratez-vous et demandez rapidement un avis médical en cas de problème, notamment après une morsure ou une griffure.',
          ],
        },
        {
          title: 'Sécurité et déplacements',
          paragraphs: [
            'Dans les parcs et les réserves, restez sur les sentiers balisés, suivez les consignes des guides, gardez vos distances avec les animaux sauvages et évitez d’explorer seul les zones isolées.',
            'Les routes et les conditions de conduite peuvent être difficiles et changer selon la météo. Évitez les trajets interurbains de nuit et renseignez-vous avant de partir. Un guide local ou un chauffeur-guide peut apporter une connaissance utile des routes et des étapes.',
            'En ville, restez attentif à votre environnement, gardez vos objets de valeur hors de vue et privilégiez les lieux fréquentés après la tombée de la nuit. Consultez les conseils aux voyageurs de votre gouvernement et les informations locales à jour.',
          ],
        },
        {
          title: 'Monnaie et paiements',
          paragraphs: [
            'La monnaie est l’ariary malgache (MGA). Les billets sont disponibles en plusieurs coupures ; prévoyez de petites sommes pour les achats courants.',
            'Les distributeurs et les paiements par carte sont plus accessibles dans les grandes villes et certains établissements touristiques. Dans les petites villes et les zones rurales, l’argent liquide peut être nécessaire. Informez votre banque de votre voyage et gardez vos espèces en lieu sûr.',
            'Changez votre argent auprès d’établissements reconnus et conservez les reçus. Les pourboires sont à votre appréciation et le marchandage, lorsqu’il est pratiqué, se fait avec courtoisie.',
            'Les règles douanières sur les montants à déclarer et l’exportation de monnaie peuvent changer et diffèrent selon les situations. Vérifiez les seuils auprès des autorités officielles avant votre départ ; les montants trouvés dans des documents anciens peuvent être contradictoires ou obsolètes.',
          ],
        },
        {
          title: 'Climat et saisons',
          paragraphs: [
            'Madagascar connaît des climats différents selon la région, l’altitude et la saison. À titre indicatif, la période plus sèche se situe souvent entre mai et octobre, et la période plus pluvieuse entre novembre et avril, mais ces repères varient localement.',
            'La côte Est est généralement humide, les Hautes Terres centrales sont plus fraîches en altitude, tandis que l’Ouest et le Sud connaissent souvent des conditions plus sèches. Les pluies peuvent modifier l’état des routes et l’accès à certaines étapes.',
            'Vérifiez les prévisions et les conditions locales pour les dates et les régions de votre voyage, notamment pendant la saison cyclonique. Prévoyez un itinéraire flexible.',
          ],
        },
      ],
      faqTitle: 'Questions fréquentes avant de partir à Madagascar',
      faqs: [
        ['Que faut-il préparer avant un voyage à Madagascar ?', 'Vérifiez les formalités d’entrée, consultez un professionnel de santé pour des conseils adaptés, prévoyez une assurance voyage et renseignez-vous sur les conditions de route et la météo de votre itinéraire.'],
        ['Faut-il des vaccins ou un traitement contre le paludisme ?', 'Les recommandations dépendent de votre santé, de votre itinéraire et des règles en vigueur. Consultez un professionnel de santé ou une clinique de médecine des voyages avant le départ.'],
        ['Est-il conseillé de conduire entre les villes la nuit ?', 'Les trajets interurbains de nuit sont à éviter. Les conditions routières peuvent être difficiles ; vérifiez les conseils officiels et planifiez les déplacements de jour.'],
        ['Quelle est la meilleure saison pour visiter Madagascar ?', 'Cela dépend des régions et des activités. Les saisons et conditions locales varient ; vérifiez les prévisions et l’état des routes pour vos dates.'],
        ['Quelle monnaie utiliser à Madagascar ?', 'La monnaie est l’ariary malgache (MGA). Les paiements par carte ne sont pas disponibles partout, surtout hors des grandes villes.'],
      ],
      seo: {
        title: 'Conseils de voyage à Madagascar',
        description:
          'Préparez votre voyage à Madagascar avec des conseils sur la culture, la santé, la sécurité, l’ariary, le climat et les déplacements.',
        keywords: ['conseils voyage Madagascar', 'préparer voyage Madagascar', 'sécurité Madagascar voyage', 'santé voyage Madagascar', 'climat Madagascar'],
      },
    },
    madagascar: {
      title: 'Madagascar, l’île-continent',
      excerpt:
        'Découvrez Madagascar, ses paysages, sa culture et sa biodiversité, et préparez un voyage avec un chauffeur-guide local.',
      hero: 'Madagascar, l’île-continent',
      heroSubtitle: 'Nature singulière, culture riche et rencontres',
      sections: [
        {
          title: 'Un voyage inoubliable',
          paragraphs: [
            'Madagascar est une grande île de l’océan Indien, à l’est de l’Afrique et séparée du continent par le canal du Mozambique. Les Malgaches sont issus d’histoires et d’influences diverses, notamment africaines et sud-est asiatiques.',
            'L’île est connue pour ses plages, ses paysages contrastés, ses baobabs et ses lémuriens. Sa biodiversité et sa culture en font une destination de découverte, à parcourir dans le respect des milieux naturels et des communautés.',
          ],
          imageIndex: 0,
          alt: 'Paysage de Madagascar',
        },
        {
          title: 'Le continent insulaire',
          paragraphs: [
            'Madagascar se trouve dans l’océan Indien, au sud de l’équateur. Ses reliefs comprennent les Hautes Terres centrales, des vallées et bassins, des montagnes et des plaines côtières.',
            'Les Hautes Terres abritent Antananarivo, la capitale. Les massifs du Maromokotro au Nord, de l’Ankaratra au centre et de l’Andringitra au Sud illustrent la diversité des reliefs. Les côtes Est et Ouest possèdent des paysages et des écosystèmes différents.',
          ],
          imageIndex: 1,
          alt: 'Massif de Tsaranoro à Madagascar',
        },
        {
          title: 'Climat et saisons',
          paragraphs: [
            'Le climat est tropical, avec des variations selon l’altitude et les régions. La saison plus sèche se situe généralement de mai à octobre et la saison plus pluvieuse de novembre à avril, avec des différences locales.',
            'La côte Est est plus humide, les Hautes Terres sont plus fraîches en altitude, et certaines régions de l’Ouest et du Sud sont plus sèches. Les conditions influencent les routes et les activités : vérifiez les prévisions locales avant de planifier votre itinéraire.',
          ],
        },
        {
          title: 'Une histoire et des cultures plurielles',
          paragraphs: [
            'L’histoire de Madagascar s’est construite au fil de migrations et d’échanges dans l’océan Indien. Les héritages africains et sud-est asiatiques se rencontrent dans les langues, les traditions et les cultures malgaches.',
            'Découvrir le pays, c’est aussi prendre le temps de rencontrer ses habitants, de respecter les coutumes locales et de mieux comprendre les régions traversées.',
          ],
        },
      ],
      faqTitle: 'Questions pour découvrir Madagascar',
      faqs: [
        ['Pourquoi Madagascar est-elle appelée une île-continent ?', 'Sa grande taille et la variété de ses reliefs, de ses climats et de ses écosystèmes lui donnent une grande diversité de paysages et de milieux naturels.'],
        ['Quelle est la meilleure période pour visiter Madagascar ?', 'Elle dépend des régions et des activités prévues. Les conditions varient d’une côte à l’autre et selon l’altitude ; vérifiez les prévisions locales avant le départ.'],
        ['Que peut-on découvrir lors d’un voyage à Madagascar ?', 'Les paysages, les parcs et réserves, les baobabs, les lémuriens, les plages et les cultures régionales, en respectant les consignes locales et les espaces naturels.'],
      ],
      seo: {
        title: 'Madagascar, l’île-continent',
        description:
          'Explorez les paysages, la biodiversité et les cultures de Madagascar et préparez votre voyage avec un chauffeur-guide local.',
        keywords: ['voyage Madagascar', 'découvrir Madagascar', 'biodiversité Madagascar', 'culture malgache', 'paysages Madagascar'],
      },
    },
    contact: {
      title: 'Contactez-nous | Anabo Roadtrip Madagascar',
      excerpt:
        'Une question sur Madagascar ou un circuit privé ? Contactez Anabo Roadtrip Madagascar pour préparer votre voyage.',
      hero: 'Contactez-nous !',
      introTitle: 'Nous serions ravis de vous lire',
      intro: [
        'Nous sommes là pour répondre à vos questions sur nos circuits, Madagascar ou votre projet de voyage. Demandez-nous des conseils ou des informations pour préparer votre itinéraire.',
        'Nous privilégions un accompagnement personnalisé pour vous aider à organiser un voyage privé dans notre pays. Écrivez-nous : nous avons hâte de vous lire.',
      ],
      formTitle: 'Laissez-nous un message',
      formDescription:
        'Une question ou une demande de devis ? Décrivez-nous votre projet et nous serons ravis de vous aider à préparer votre circuit privé à Madagascar.',
      faqTitle: 'Questions pour organiser votre voyage',
      faqs: [
        ['Comment demander un devis pour un circuit à Madagascar ?', 'Utilisez le formulaire de demande de devis et indiquez vos dates, les régions souhaitées, le nombre de voyageurs et vos questions.'],
        ['Puis-je demander conseil avant de choisir un circuit ?', 'Oui. Contactez-nous pour discuter de vos envies, de la durée du séjour et des régions que vous aimeriez découvrir.'],
      ],
      seo: {
        title: 'Contact | Anabo Roadtrip Madagascar',
        description:
          'Contactez Anabo Roadtrip Madagascar pour poser vos questions ou préparer un circuit privé avec chauffeur-guide.',
        keywords: ['contact Anabo Madagascar', 'devis circuit Madagascar', 'voyage privé Madagascar', 'chauffeur-guide Madagascar'],
      },
    },
    tourIdeas: {
      title: 'Idées de circuits à Madagascar',
      subtitle:
        'Madagascar, terre de merveilles naturelles et de trésors culturels, vous invite à imaginer votre propre aventure.',
      intro:
        'Avec ses paysages variés, sa faune singulière et sa culture riche, l’île offre mille façons de voyager. Les circuits présentés donnent un aperçu des possibilités et peuvent vous inspirer pour concevoir un itinéraire selon vos envies et vos centres d’intérêt. Je serai ravi de vous aider à choisir les étapes et le rythme qui vous conviennent.',
      metaTitle: 'Idées de circuits à Madagascar | Anabo Roadtrip',
      metaDescription:
        'Découvrez des idées de circuits à Madagascar : RN7, Tsingy, baobabs, parcs, côte Est et Nosy Be. Voyagez avec un chauffeur-guide local.',
      keywords: ['circuit Madagascar', 'idées voyage Madagascar', 'road trip Madagascar', 'circuit RN7', 'circuit Nosy Be', 'chauffeur-guide Madagascar'],
      faqTitle: 'Questions pour choisir un circuit à Madagascar',
      faqs: [
        ['Quels circuits peut-on faire à Madagascar ?', 'Les idées présentées incluent la RN7 et le Sud, les Tsingy et les baobabs, les parcs de l’Est, le Nord et Nosy Be, ainsi que des séjours dans les Hautes Terres.'],
        ['Comment choisir un itinéraire adapté à mon voyage ?', 'Tenez compte de la durée du séjour, des régions souhaitées, de la saison et des conditions routières. Les étapes peuvent être discutées avec un chauffeur-guide local.'],
        ['Les circuits proposés sont-ils personnalisables ?', 'Oui. Les suggestions servent de point de départ ; les étapes et le rythme peuvent être ajustés et doivent être confirmés selon les disponibilités et les conditions locales.'],
      ],
    },
    tourDescriptions: {
      'sud-et-rn7': 'Ce circuit mêle culture et nature le long de la célèbre RN7, entre champs verdoyants, terres rouges, ciel bleu et mer turquoise.',
      'baobab-et-tsingy': 'Explorez le Sud-Ouest authentique : Morondava, la rivière Tsiribihina, les Tsingy et la célèbre Allée des Baobabs.',
      'lemuriens-et-circuit-vers-l-est': 'Découvrez le parc national d’Andasibe et sa forêt tropicale, habitat de lémuriens, de caméléons et de plantes endémiques.',
      'circuit-safari-en-voiture': 'Explorez parcs nationaux et réserves pour découvrir la faune, la flore et les paysages de Madagascar.',
      'cote-est-et-lemuriens': 'Reliez Antananarivo à Sainte-Marie via Andasibe, le canal des Pangalanes et les paysages de la côte Est.',
      'voyage-hors-route-et-baobabs': 'Partez à l’aventure entre les pistes côtières du Sud-Ouest, la Tsiribihina, les Tsingy, les baobabs et la RN7.',
      'ampefy-et-la-campagne': 'À Ampefy, découvrez le lac Itasy, la cascade Lily et la campagne Merina à votre rythme.',
      'train-manakara': 'Voyagez de Fianarantsoa à Manakara en train à travers les paysages luxuriants de la côte Est.',
      'circuit-nord-et-nosibe': 'Rejoignez Nosy Be à travers les parcs, les paysages du Nord, les plages et les rencontres locales.',
    },
    tourImageAlts: {
      'sud-et-rn7': 'Paysages colorés le long de la RN7 à Madagascar',
      'baobab-et-tsingy': 'Allée des Baobabs au coucher du soleil',
      'lemuriens-et-circuit-vers-l-est': 'Indri indri dans la forêt de Madagascar',
      'circuit-safari-en-voiture': 'Fossa de Madagascar',
      'cote-est-et-lemuriens': 'Canal des Pangalanes sur la côte Est',
      'voyage-hors-route-et-baobabs': 'Allée des Baobabs lors d’un road trip dans le Grand Sud',
      'ampefy-et-la-campagne': 'Cascade Lily dans la région d’Ampefy',
      'train-manakara': 'Train reliant Fianarantsoa à Manakara',
      'circuit-nord-et-nosibe': 'Plage de Nosy Be à Madagascar',
    },
  },
  en: {
    about: {
      title: 'About | Anabo Roadtrip Madagascar',
      excerpt:
        'Meet Vonjy, your driver-guide in Madagascar, and discover the values behind Anabo Roadtrip Madagascar.',
      hero: "I'm Vonjy",
      heroSubtitle: 'Your driver-guide in Madagascar',
      philosophy: 'Travel with heart, choose a more sustainable way',
      welcome: [
        'Salama and welcome! I’m Vonjy. I accompany you on the roads of Madagascar and help you discover the country, its landscapes and its people.',
        'Every journey is an opportunity to meet people and support the communities and local partners who bring each region to life.',
      ],
      commitments: [
        {
          title: 'Local knowledge',
          items: [
            { label: 'Cultural awareness', text: 'Understanding local customs helps avoid misunderstandings and encourages respectful conversations with local people.' },
            { label: 'Routes planned for local conditions', text: 'We plan routes with roads, weather, local conditions and your preferred stops in mind.' },
            { label: 'Trip preparation', text: 'Conditions can change, so routes are adjusted using available information and local guidance.' },
          ],
        },
        {
          title: 'Reliable transport',
          items: [
            { label: 'Maintained vehicles', text: 'Vehicle owners look after and maintain their vehicles to prepare for journeys in suitable condition.' },
            { label: 'Experienced drivers', text: 'Our drivers understand the realities of driving in Madagascar and adapt to the roads and conditions.' },
            { label: 'On-board safety', text: 'Vehicle safety instructions and equipment are checked before departure.' },
          ],
        },
        {
          title: 'Community connections',
          items: [
            { label: 'Local knowledge', text: 'Knowledge of the country and its regions helps create meaningful encounters and context for your journey.' },
            { label: 'Respectful interaction', text: 'We encourage exchanges that respect local people, customs and the places we visit.' },
          ],
        },
        {
          title: 'A trusted team',
          items: [
            { label: 'Local partners', text: 'Depending on the route, your trip may involve drivers, vehicle owners, local guides, accommodation providers and porters.' },
            { label: 'On-the-ground experience', text: 'Trip planning draws on regional knowledge and information from local partners.' },
            { label: 'Languages', text: 'Malagasy is our national language. Depending on the person and region, local partners may also speak French or English.' },
          ],
        },
      ],
      local: [
        'Choosing local providers helps support communities, businesses and craftspeople. This commitment goes beyond buying souvenirs: a locally prepared meal, a visit to a community reserve or the services of a park guide can also contribute to the regional economy.',
        'Local businesses are at the heart of a journey: vehicle hire, boat or pirogue transfers, accommodation and activities. We aim to ensure that travel spending benefits the people who welcome you.',
      ],
      sustainable: [
        'We want to contribute to tourism that is considerate of Madagascar’s communities, culture and environment.',
        'Protecting natural areas and recognising the everyday needs of local people go hand in hand. We aim to make responsible choices and reduce our impact while travelling.',
      ],
      faqTitle: 'Questions about travelling with a driver-guide',
      faqs: [
        ['Why travel with a driver-guide in Madagascar?', 'A driver-guide understands local roads and conditions. They can accompany you between stops and help adapt the route to circumstances along the way.'],
        ['Can I customise a Madagascar itinerary?', 'Yes. Regions, stops and pace can be discussed around your interests, travel dates and local conditions. Services are confirmed before booking.'],
        ['How can a trip support local communities?', 'By choosing local guides, accommodation, transport providers, craftspeople and other local services along the route.'],
      ],
      seo: {
        title: 'About | Anabo Roadtrip Madagascar',
        description:
          'Meet Vonjy, a driver-guide in Madagascar, and learn about Anabo Roadtrip’s local partnerships and tailor-made journeys.',
        keywords: ['Anabo Roadtrip Madagascar', 'Madagascar driver-guide', 'tailor-made Madagascar tour', 'local tourism Madagascar', 'Madagascar road trip'],
      },
    },
    guidelines: {
      title: 'Madagascar travel advice',
      excerpt:
        'Practical advice for visiting Madagascar, covering culture, health, safety, money and climate.',
      hero: 'Tips for an unforgettable adventure in Madagascar',
      intro:
        'Hello, fellow travellers! Madagascar offers remarkable scenery, distinctive wildlife and a rich culture. Here are general pointers to help you prepare, based on local experience. Conditions and official guidance can change, so check current information before departure.',
      sections: [
        {
          title: 'Cultural etiquette and local encounters',
          paragraphs: [
            'A friendly “Salama” and a smile are a warm way to begin a conversation. Greet people before asking questions, and say “Misaotra” to thank them.',
            'Malagasy is the national language; French is also spoken in many settings, particularly in towns. Learning a few Malagasy phrases can make encounters easier.',
            'Learn about local customs, follow guidance at sacred places and dress appropriately, especially in villages or religious sites. Always ask permission before photographing people or their belongings.',
            'Patience and flexibility are useful. “Moramora” is a reminder to take time and adapt to the local pace.',
          ],
        },
        {
          title: 'Health and preparation',
          paragraphs: [
            'This is general information, not medical advice. Consult a healthcare professional or travel clinic well before departure for recommendations based on your itinerary and personal circumstances.',
            'Check that routine vaccinations are up to date and ask about any vaccines or preventive medication that may be recommended. Yellow fever requirements can depend on where you are travelling from and current rules; consult official sources.',
            'The risk of mosquito-borne illness varies by region and season. Ask a healthcare professional for advice and follow their guidance on prevention, repellents, covering clothing and bed nets.',
            'Choose safe food and water, wash your hands regularly and take care with raw foods. Bring enough personal medication, prescriptions and travel insurance that covers healthcare and, if needed, medical evacuation.',
            'Healthcare facilities can be limited outside major cities. Protect yourself from the sun, stay hydrated and seek medical advice promptly if you are unwell, especially after an animal bite or scratch.',
          ],
        },
        {
          title: 'Safety and getting around',
          paragraphs: [
            'In national parks and reserves, stay on marked trails, follow your guide’s instructions, keep a safe distance from wildlife and avoid exploring remote areas alone.',
            'Roads and driving conditions can be challenging and may change with the weather. Avoid intercity travel at night and check conditions before setting out. A local guide or driver-guide can provide useful knowledge of routes and stops.',
            'In towns, stay aware of your surroundings, keep valuables out of sight and choose well-used places after dark. Check your government’s current travel advice and local updates.',
          ],
        },
        {
          title: 'Currency and payments',
          paragraphs: [
            'The local currency is the Malagasy ariary (MGA). Banknotes come in several denominations; keep smaller notes for everyday purchases.',
            'ATMs and card payments are more available in major towns and some tourist businesses. Cash may be needed in smaller towns and rural areas. Let your bank know about your trip and keep cash secure.',
            'Exchange money through recognised providers and keep receipts. Tips are at your discretion; where bargaining is customary, do so politely.',
            'Customs rules for declaring money and taking currency out of the country can change and depend on individual circumstances. Check current thresholds with official authorities before travelling; figures in older sources may conflict or be out of date.',
          ],
        },
        {
          title: 'Climate and seasons',
          paragraphs: [
            'Madagascar’s climate varies by region, elevation and season. As a general guide, the drier period is often from May to October and the wetter period from November to April, but local patterns differ.',
            'The East Coast is generally humid, the Central Highlands are cooler at higher elevations, and parts of the West and South are often drier. Rain can affect road conditions and access to some stops.',
            'Check forecasts and local conditions for your travel dates and regions, especially during cyclone season, and keep your itinerary flexible.',
          ],
        },
      ],
      faqTitle: 'Common questions before travelling to Madagascar',
      faqs: [
        ['What should I prepare before travelling to Madagascar?', 'Check entry requirements, ask a healthcare professional for personal advice, arrange travel insurance and check road and weather conditions for your route.'],
        ['Do I need vaccinations or malaria prevention for Madagascar?', 'Advice depends on your health, itinerary and current requirements. Consult a healthcare professional or travel clinic before departure.'],
        ['Is it advisable to drive between cities at night?', 'Avoid intercity travel at night. Road conditions can be challenging; check official travel advice and plan journeys during daylight.'],
        ['When is the best time to visit Madagascar?', 'It depends on the regions and activities. Local seasons and conditions vary, so check forecasts and road conditions for your dates.'],
        ['What currency is used in Madagascar?', 'The currency is the Malagasy ariary (MGA). Card payments are not available everywhere, especially outside major towns.'],
      ],
      seo: {
        title: 'Madagascar Travel Advice',
        description:
          'Plan a trip to Madagascar with practical advice on local culture, health, safety, the ariary, climate and getting around.',
        keywords: ['Madagascar travel advice', 'planning a trip to Madagascar', 'Madagascar travel safety', 'Madagascar health advice', 'Madagascar climate'],
      },
    },
    madagascar: {
      title: 'Madagascar, the island continent',
      excerpt:
        'Discover Madagascar’s landscapes, culture and biodiversity, and plan your trip with a local driver-guide.',
      hero: 'Madagascar, the Island Continent',
      heroSubtitle: 'Distinctive nature, rich culture and local encounters',
      sections: [
        {
          title: 'An unforgettable journey',
          paragraphs: [
            'Madagascar is a large island in the Indian Ocean, east of Africa and separated from the mainland by the Mozambique Channel. Malagasy people have diverse histories and heritage, including African and Southeast Asian influences.',
            'The island is known for its beaches, varied landscapes, baobabs and lemurs. Its biodiversity and culture make it a destination for discovery, best explored with respect for natural environments and local communities.',
          ],
          imageIndex: 0,
          alt: 'Landscape in Madagascar',
        },
        {
          title: 'The island continent',
          paragraphs: [
            'Madagascar lies in the Indian Ocean, south of the equator. Its landforms include the Central Highlands, valleys and basins, mountains and coastal plains.',
            'The Central Highlands are home to Antananarivo, the capital. The Maromokotro massif in the North, Ankaratra in the Central Highlands and Andringitra in the South illustrate the island’s varied terrain. The East and West coasts have distinct landscapes and ecosystems.',
          ],
          imageIndex: 1,
          alt: 'Tsaranoro massif in Madagascar',
        },
        {
          title: 'Climate and seasons',
          paragraphs: [
            'Madagascar has a tropical climate that varies with elevation and region. The drier period is generally from May to October and the wetter period from November to April, with local differences.',
            'The East Coast is more humid, the highlands are cooler at elevation, and parts of the West and South are drier. Conditions affect roads and activities, so check local forecasts before planning your route.',
          ],
        },
        {
          title: 'A history and culture shaped by many influences',
          paragraphs: [
            'Madagascar’s history has been shaped by migration and exchange across the Indian Ocean. African and Southeast Asian heritage meet in Malagasy languages, traditions and cultures.',
            'Discovering the country also means taking time to meet local people, respect customs and learn about the regions along the way.',
          ],
        },
      ],
      faqTitle: 'Questions about discovering Madagascar',
      faqs: [
        ['Why is Madagascar called an island continent?', 'Its size and varied terrain, climates and ecosystems create a remarkable range of landscapes and natural environments.'],
        ['When is the best time to visit Madagascar?', 'It depends on the regions and activities. Conditions vary from one coast to another and with elevation, so check local forecasts before travelling.'],
        ['What can I discover on a trip to Madagascar?', 'Landscapes, parks and reserves, baobabs, lemurs, beaches and regional cultures, while respecting local guidance and natural areas.'],
      ],
      seo: {
        title: 'Discover Madagascar, the Island Continent',
        description:
          'Explore Madagascar’s landscapes, biodiversity and cultures, and plan your trip with a local driver-guide.',
        keywords: ['Madagascar travel', 'discover Madagascar', 'Madagascar biodiversity', 'Malagasy culture', 'Madagascar landscapes'],
      },
    },
    contact: {
      title: 'Contact us | Anabo Roadtrip Madagascar',
      excerpt:
        'Have a question about Madagascar or a private tour? Contact Anabo Roadtrip Madagascar to plan your trip.',
      hero: 'Get in touch!',
      introTitle: 'We would love to hear from you',
      intro: [
        'We are here to answer your questions about our tours, Madagascar or your travel plans. Ask us for advice or information to help prepare your itinerary.',
        'We take a personal approach and are happy to help you organise a private trip in our country. Send us a message — we look forward to hearing from you.',
      ],
      formTitle: 'Leave us a message',
      formDescription:
        'Have a question or want to request a quote? Tell us about your plans and we will be glad to help you prepare a private tour in Madagascar.',
      faqTitle: 'Questions about planning your trip',
      faqs: [
        ['How can I request a quote for a Madagascar tour?', 'Use the quote request form and include your dates, preferred regions, number of travellers and any questions.'],
        ['Can I ask for advice before choosing a tour?', 'Yes. Contact us to discuss your interests, trip length and the regions you would like to explore.'],
      ],
      seo: {
        title: 'Contact | Anabo Roadtrip Madagascar',
        description:
          'Contact Anabo Roadtrip Madagascar with questions or to plan a private tour with a driver-guide.',
        keywords: ['contact Anabo Madagascar', 'Madagascar tour quote', 'private Madagascar tour', 'Madagascar driver-guide'],
      },
    },
    tourIdeas: {
      title: 'Tour ideas in Madagascar',
      subtitle:
        'Madagascar, a land of natural wonders and cultural treasures, invites you to imagine your own adventure.',
      intro:
        'With varied landscapes, distinctive wildlife and a rich culture, the island offers many ways to travel. These circuits give you a glimpse of what is possible and inspiration for an itinerary shaped around your interests. I would be happy to help you choose suitable stops and a comfortable pace.',
      metaTitle: 'Madagascar Tour Ideas | Anabo Roadtrip',
      metaDescription:
        'Explore Madagascar tour ideas: the RN7, Tsingy, baobabs, national parks, the East Coast and Nosy Be with a local driver-guide.',
      keywords: ['Madagascar tour ideas', 'Madagascar itinerary', 'Madagascar road trip', 'RN7 tour Madagascar', 'Nosy Be tour', 'Madagascar driver-guide'],
      faqTitle: 'Questions about choosing a Madagascar tour',
      faqs: [
        ['What tours can I take in Madagascar?', 'Ideas include the RN7 and the South, the Tsingy and baobabs, eastern parks, the North and Nosy Be, and trips in the Central Highlands.'],
        ['How do I choose an itinerary for my trip?', 'Consider your travel time, preferred regions, season and road conditions. A local driver-guide can help discuss the route and stops.'],
        ['Can the suggested tours be customised?', 'Yes. Suggestions are a starting point; stops and pace can be adapted and confirmed according to local availability and conditions.'],
      ],
    },
    tourDescriptions: {
      'sud-et-rn7': 'Combine culture and nature along the famous RN7, passing green fields, red earth, blue skies and turquoise sea.',
      'baobab-et-tsingy': 'Explore the authentic southwest: Morondava, the Tsiribihina River, the Tsingy and the famous Avenue of the Baobabs.',
      'lemuriens-et-circuit-vers-l-est': 'Discover Andasibe National Park and its rainforest, home to lemurs, chameleons and endemic plants.',
      'circuit-safari-en-voiture': 'Explore national parks and reserves to discover Madagascar’s wildlife, plants and landscapes.',
      'cote-est-et-lemuriens': 'Travel from Antananarivo to Sainte-Marie via Andasibe, the Pangalanes Canal and the East Coast.',
      'voyage-hors-route-et-baobabs': 'Set out across southwest coastal tracks, the Tsiribihina, the Tsingy, baobabs and the RN7.',
      'ampefy-et-la-campagne': 'Discover Lake Itasy, Lily Waterfall and the Merina countryside in Ampefy at your own pace.',
      'train-manakara': 'Travel by train from Fianarantsoa to Manakara through the lush landscapes of the East Coast.',
      'circuit-nord-et-nosibe': 'Travel to Nosy Be through northern parks and landscapes, beaches and local encounters.',
    },
    tourImageAlts: {
      'sud-et-rn7': 'Colourful landscapes along the RN7 in Madagascar',
      'baobab-et-tsingy': 'Avenue of the Baobabs at sunset',
      'lemuriens-et-circuit-vers-l-est': 'Indri indri in a Madagascar rainforest',
      'circuit-safari-en-voiture': 'Fossa in Madagascar',
      'cote-est-et-lemuriens': 'Pangalanes Canal on the East Coast',
      'voyage-hors-route-et-baobabs': 'Avenue of the Baobabs on a Grand South road trip',
      'ampefy-et-la-campagne': 'Lily Waterfall in the Ampefy region',
      'train-manakara': 'Train between Fianarantsoa and Manakara',
      'circuit-nord-et-nosibe': 'Beach on Nosy Be, Madagascar',
    },
  },
  it: {
    about: {
      title: 'Chi siamo | Anabo Roadtrip Madagascar',
      excerpt:
        'Incontra Vonjy, il tuo autista-guida in Madagascar, e scopri i valori di Anabo Roadtrip Madagascar.',
      hero: 'Sono Vonjy',
      heroSubtitle: 'Il vostro autista-guida in Madagascar',
      philosophy: 'Viaggiare con il cuore, scegliere uno stile di vita sostenibile',
      welcome: [
        'Salama e benvenuti! Sono Vonjy. Vi accompagno sulle strade del Madagascar per aiutarvi a scoprire il Paese, i suoi paesaggi e i suoi abitanti.',
        'Ogni viaggio è un’occasione per incontrare persone e sostenere le comunità e i partner locali che animano le regioni attraversate.',
      ],
      commitments: [
        {
          title: 'Conoscenze locali',
          items: [
            { label: 'Rispetto culturale', text: 'Conoscere le usanze locali aiuta a evitare malintesi e favorisce scambi rispettosi con gli abitanti.' },
            { label: 'Itinerari adeguati', text: 'Pianifichiamo il percorso tenendo conto delle strade, del meteo, delle condizioni locali e delle tappe desiderate.' },
            { label: 'Preparazione del viaggio', text: 'Le condizioni possono cambiare: adattiamo il percorso in base alle informazioni disponibili e ai consigli locali.' },
          ],
        },
        {
          title: 'Trasporti affidabili',
          items: [
            { label: 'Veicoli curati', text: 'I proprietari si occupano della manutenzione dei veicoli per prepararli ai tragitti in condizioni adeguate.' },
            { label: 'Autisti esperti', text: 'I nostri autisti conoscono le condizioni di guida in Madagascar e si adattano alle strade e alle circostanze.' },
            { label: 'Sicurezza a bordo', text: 'Prima della partenza vengono controllate le istruzioni e le dotazioni di sicurezza del veicolo.' },
          ],
        },
        {
          title: 'Legami con le comunità',
          items: [
            { label: 'Conoscenze locali', text: 'La conoscenza del Paese e delle sue regioni favorisce gli incontri e aiuta a comprendere il viaggio.' },
            { label: 'Incontri rispettosi', text: 'Promuoviamo scambi rispettosi delle persone, delle usanze e dei luoghi visitati.' },
          ],
        },
        {
          title: 'Un team di fiducia',
          items: [
            { label: 'Partner locali', text: 'A seconda dell’itinerario, il viaggio può coinvolgere autisti, proprietari di veicoli, guide locali, strutture ricettive e portatori.' },
            { label: 'Esperienza sul territorio', text: 'La preparazione si basa sulla conoscenza delle regioni e sulle informazioni dei partner locali.' },
            { label: 'Lingue', text: 'Il malgascio è la nostra lingua nazionale. A seconda delle persone e delle regioni, alcuni partner parlano anche francese o inglese.' },
          ],
        },
      ],
      local: [
        'Scegliere operatori locali aiuta a sostenere comunità, imprese e artigiani. L’impegno non si limita all’acquisto di souvenir: un pasto preparato localmente, la visita a una riserva comunitaria o i servizi di una guida contribuiscono all’economia delle regioni.',
        'Le attività locali sono al centro del viaggio: noleggio di veicoli, trasferimenti in barca o piroga, alloggi e attività. Vogliamo che le spese del soggiorno vadano a beneficio delle persone che vi accolgono.',
      ],
      sustainable: [
        'Vogliamo contribuire a un turismo attento alle comunità, alla cultura e all’ambiente del Madagascar.',
        'La tutela degli ambienti naturali e le esigenze quotidiane degli abitanti devono essere considerate insieme. Cerchiamo di fare scelte responsabili e ridurre il nostro impatto durante il viaggio.',
      ],
      faqTitle: 'Domande sui viaggi con autista-guida',
      faqs: [
        ['Perché viaggiare con un autista-guida in Madagascar?', 'Un autista-guida conosce le strade e le condizioni locali. Può accompagnarvi negli spostamenti e aiutare ad adattare il percorso alle circostanze.'],
        ['È possibile personalizzare un itinerario in Madagascar?', 'Sì. Regioni, tappe e ritmo possono essere concordati in base ai vostri interessi, alle date e alle condizioni locali. I servizi vengono confermati prima della prenotazione.'],
        ['Come può un viaggio sostenere le comunità locali?', 'Scegliendo guide, alloggi, trasportatori, artigiani e altri servizi locali lungo il percorso.'],
      ],
      seo: {
        title: 'Chi siamo | Anabo Roadtrip Madagascar',
        description:
          'Incontra Vonjy, autista-guida in Madagascar, e scopri i partner locali e i viaggi su misura di Anabo Roadtrip.',
        keywords: ['Anabo Roadtrip Madagascar', 'autista-guida Madagascar', 'viaggio su misura Madagascar', 'turismo locale Madagascar', 'road trip Madagascar'],
      },
    },
    guidelines: {
      title: 'Consigli di viaggio in Madagascar',
      excerpt:
        'Consigli pratici per preparare un viaggio in Madagascar: cultura, salute, sicurezza, valuta e clima.',
      hero: 'Consigli per un’avventura indimenticabile in Madagascar',
      intro:
        'Ciao, amici viaggiatori! Il Madagascar offre paesaggi straordinari, fauna particolare e una cultura ricca. Ecco alcune indicazioni generali per preparare il soggiorno, basate sull’esperienza locale. Le condizioni e le raccomandazioni ufficiali possono cambiare: verificate le informazioni aggiornate prima della partenza.',
      sections: [
        {
          title: 'Etichetta culturale e incontri',
          paragraphs: [
            'Un cordiale «Salama» accompagnato da un sorriso è un buon modo per iniziare una conversazione. Salutare prima di fare domande e dire «Misaotra» per ringraziare rende lo scambio più caloroso.',
            'Il malgascio è la lingua nazionale; il francese è parlato anche in molti contesti, soprattutto in città. Imparare qualche parola in malgascio può facilitare gli incontri.',
            'Informatevi sulle usanze locali, seguite le indicazioni nei luoghi sacri e scegliete un abbigliamento adeguato, soprattutto nei villaggi e nei siti religiosi. Chiedete sempre il permesso prima di fotografare le persone o i loro beni.',
            'Pazienza e flessibilità sono utili. «Moramora» ricorda di prendersi il tempo necessario e adattarsi ai ritmi locali.',
          ],
        },
        {
          title: 'Salute e preparazione',
          paragraphs: [
            'Queste informazioni sono generali e non sostituiscono un parere medico. Consultate con anticipo un professionista sanitario o un centro di medicina dei viaggi per consigli adeguati al vostro itinerario e alla vostra situazione.',
            'Verificate che le vaccinazioni di routine siano aggiornate e chiedete informazioni su eventuali vaccini o trattamenti preventivi consigliati. I requisiti per la febbre gialla possono dipendere dal Paese di provenienza e dalle regole vigenti: consultate le fonti ufficiali.',
            'Il rischio di malattie trasmesse dalle zanzare varia secondo la regione e la stagione. Chiedete consiglio a un professionista sanitario e seguite le sue indicazioni su prevenzione, repellenti, abiti coprenti e zanzariere.',
            'Scegliete cibi e acqua sicuri, lavatevi spesso le mani e fate attenzione agli alimenti crudi. Portate una quantità sufficiente dei vostri farmaci, le prescrizioni e un’assicurazione di viaggio che copra le cure e, se necessario, l’evacuazione medica.',
            'Le strutture sanitarie possono essere limitate fuori dalle grandi città. Proteggetevi dal sole, bevete a sufficienza e chiedete rapidamente assistenza medica in caso di problemi, soprattutto dopo un morso o un graffio di animale.',
          ],
        },
        {
          title: 'Sicurezza e spostamenti',
          paragraphs: [
            'Nei parchi e nelle riserve restate sui sentieri segnalati, seguite le istruzioni delle guide, mantenete una distanza di sicurezza dagli animali selvatici ed evitate di esplorare da soli le zone isolate.',
            'Le strade e le condizioni di guida possono essere difficili e cambiare con il meteo. Evitate gli spostamenti interurbani di notte e informatevi prima di partire. Una guida locale o un autista-guida può offrire conoscenze utili sulle strade e sulle tappe.',
            'In città, prestate attenzione all’ambiente, tenete gli oggetti di valore fuori vista e dopo il tramonto scegliete luoghi frequentati. Consultate i consigli di viaggio aggiornati del vostro governo e le informazioni locali.',
          ],
        },
        {
          title: 'Valuta e pagamenti',
          paragraphs: [
            'La valuta locale è l’ariary malgascio (MGA). Le banconote hanno diversi tagli; tenete a disposizione banconote di piccolo valore per gli acquisti quotidiani.',
            'Bancomat e pagamenti con carta sono più diffusi nelle città principali e in alcune strutture turistiche. Nei centri minori e nelle zone rurali può essere necessario il contante. Avvisate la vostra banca del viaggio e custodite il denaro con attenzione.',
            'Cambiate denaro presso operatori riconosciuti e conservate le ricevute. La mancia è a vostra discrezione; dove si contratta, fatelo con cortesia.',
            'Le regole doganali sulle somme da dichiarare e sull’esportazione di valuta possono cambiare e dipendere dalla situazione personale. Verificate le soglie aggiornate presso le autorità ufficiali: le cifre nelle fonti datate possono essere contraddittorie o non più valide.',
          ],
        },
        {
          title: 'Clima e stagioni',
          paragraphs: [
            'Il clima del Madagascar varia secondo la regione, l’altitudine e la stagione. In generale il periodo più secco è spesso tra maggio e ottobre e quello più piovoso tra novembre e aprile, ma le condizioni locali sono diverse.',
            'La costa orientale è generalmente umida, gli Altipiani centrali sono più freschi in quota e alcune zone dell’Ovest e del Sud sono più secche. Le piogge possono influire sulle strade e sull’accesso ad alcune tappe.',
            'Controllate le previsioni e le condizioni locali per le date e le regioni del viaggio, in particolare durante la stagione dei cicloni, e mantenete flessibile l’itinerario.',
          ],
        },
      ],
      faqTitle: 'Domande frequenti prima di partire per il Madagascar',
      faqs: [
        ['Cosa preparare prima di un viaggio in Madagascar?', 'Verificate i requisiti d’ingresso, consultate un professionista sanitario, stipulate un’assicurazione di viaggio e controllate strade e meteo del vostro itinerario.'],
        ['Servono vaccini o prevenzione contro la malaria?', 'Le indicazioni dipendono dalla salute, dall’itinerario e dai requisiti aggiornati. Consultate un professionista sanitario o un centro di medicina dei viaggi prima della partenza.'],
        ['È consigliabile guidare tra le città di notte?', 'È meglio evitare gli spostamenti interurbani di notte. Le condizioni stradali possono essere difficili: controllate le indicazioni ufficiali e pianificate i tragitti di giorno.'],
        ['Qual è il periodo migliore per visitare il Madagascar?', 'Dipende dalle regioni e dalle attività. Stagioni e condizioni locali variano: controllate previsioni e strade per le vostre date.'],
        ['Quale valuta si usa in Madagascar?', 'La valuta è l’ariary malgascio (MGA). I pagamenti con carta non sono disponibili ovunque, soprattutto fuori dalle città principali.'],
      ],
      seo: {
        title: 'Consigli di viaggio in Madagascar',
        description:
          'Prepara il viaggio in Madagascar con consigli su cultura, salute, sicurezza, ariary, clima e spostamenti.',
        keywords: ['consigli viaggio Madagascar', 'preparare viaggio Madagascar', 'sicurezza Madagascar', 'salute viaggio Madagascar', 'clima Madagascar'],
      },
    },
    madagascar: {
      title: 'Madagascar, il continente insulare',
      excerpt:
        'Scopri paesaggi, cultura e biodiversità del Madagascar e prepara il viaggio con un autista-guida locale.',
      hero: 'Madagascar, l’isola-continente',
      heroSubtitle: 'Natura singolare, cultura ricca e incontri',
      sections: [
        {
          title: 'Un viaggio indimenticabile',
          paragraphs: [
            'Il Madagascar è una grande isola dell’Oceano Indiano, a est dell’Africa e separata dal continente dal Canale del Mozambico. Il popolo malgascio ha storie e origini diverse, con influenze africane e del Sud-est asiatico.',
            'L’isola è nota per le spiagge, i paesaggi vari, i baobab e i lemuri. Biodiversità e cultura ne fanno una destinazione da scoprire rispettando gli ambienti naturali e le comunità locali.',
          ],
          imageIndex: 0,
          alt: 'Paesaggio del Madagascar',
        },
        {
          title: 'Il continente insulare',
          paragraphs: [
            'Il Madagascar si trova nell’Oceano Indiano, a sud dell’equatore. I suoi rilievi comprendono gli Altipiani centrali, valli e bacini, montagne e pianure costiere.',
            'Gli Altipiani ospitano Antananarivo, la capitale. I massicci del Maromokotro a nord, dell’Ankaratra al centro e dell’Andringitra a sud mostrano la varietà del territorio. Le coste orientale e occidentale presentano paesaggi ed ecosistemi diversi.',
          ],
          imageIndex: 1,
          alt: 'Massiccio di Tsaranoro in Madagascar',
        },
        {
          title: 'Clima e stagioni',
          paragraphs: [
            'Il clima è tropicale e varia con l’altitudine e le regioni. Il periodo più secco va generalmente da maggio a ottobre e quello più piovoso da novembre ad aprile, con differenze locali.',
            'La costa orientale è più umida, gli Altipiani sono più freschi in quota e alcune aree dell’Ovest e del Sud sono più secche. Le condizioni influenzano strade e attività: controllate le previsioni locali prima di pianificare l’itinerario.',
          ],
        },
        {
          title: 'Una storia e culture dalle molte influenze',
          paragraphs: [
            'La storia del Madagascar è stata plasmata da migrazioni e scambi attraverso l’Oceano Indiano. Eredità africane e del Sud-est asiatico si incontrano nelle lingue, nelle tradizioni e nelle culture malgasce.',
            'Scoprire il Paese significa anche dedicare tempo agli incontri, rispettare le usanze locali e conoscere meglio le regioni attraversate.',
          ],
        },
      ],
      faqTitle: 'Domande per scoprire il Madagascar',
      faqs: [
        ['Perché il Madagascar è chiamato isola-continente?', 'Le dimensioni e la varietà di rilievi, climi ed ecosistemi offrono una grande diversità di paesaggi e ambienti naturali.'],
        ['Qual è il periodo migliore per visitare il Madagascar?', 'Dipende dalle regioni e dalle attività. Le condizioni cambiano da una costa all’altra e con l’altitudine: controllate le previsioni locali.'],
        ['Cosa si può scoprire durante un viaggio in Madagascar?', 'Paesaggi, parchi e riserve, baobab, lemuri, spiagge e culture regionali, rispettando le indicazioni locali e gli ambienti naturali.'],
      ],
      seo: {
        title: 'Madagascar, il continente insulare',
        description:
          'Scopri paesaggi, biodiversità e culture del Madagascar e prepara il viaggio con un autista-guida locale.',
        keywords: ['viaggio Madagascar', 'scoprire Madagascar', 'biodiversità Madagascar', 'cultura malgascia', 'paesaggi Madagascar'],
      },
    },
    contact: {
      title: 'Contatti | Anabo Roadtrip Madagascar',
      excerpt:
        'Hai domande sul Madagascar o su un circuito privato? Contatta Anabo Roadtrip Madagascar per preparare il viaggio.',
      hero: 'Contattaci!',
      introTitle: 'Saremo felici di leggerti',
      intro: [
        'Siamo a disposizione per rispondere alle domande sui circuiti, sul Madagascar o sul tuo progetto di viaggio. Chiedici consigli e informazioni per preparare l’itinerario.',
        'Offriamo un accompagnamento personalizzato per aiutarti a organizzare un viaggio privato nel nostro Paese. Scrivici: non vediamo l’ora di leggerti.',
      ],
      formTitle: 'Lasciaci un messaggio',
      formDescription:
        'Hai una domanda o vuoi chiedere un preventivo? Raccontaci il tuo progetto: saremo felici di aiutarti a preparare un circuito privato in Madagascar.',
      faqTitle: 'Domande per organizzare il viaggio',
      faqs: [
        ['Come posso chiedere un preventivo per un circuito in Madagascar?', 'Usa il modulo di richiesta e indica date, regioni desiderate, numero di viaggiatori e le tue domande.'],
        ['Posso chiedere un consiglio prima di scegliere un circuito?', 'Sì. Contattaci per parlare dei tuoi interessi, della durata del soggiorno e delle regioni che vorresti visitare.'],
      ],
      seo: {
        title: 'Contatti | Anabo Roadtrip Madagascar',
        description:
          'Contatta Anabo Roadtrip Madagascar per informazioni o per organizzare un circuito privato con autista-guida.',
        keywords: ['contatto Anabo Madagascar', 'preventivo circuito Madagascar', 'viaggio privato Madagascar', 'autista-guida Madagascar'],
      },
    },
    tourIdeas: {
      title: 'Idee di viaggio in Madagascar',
      subtitle:
        'Il Madagascar, terra di meraviglie naturali e tesori culturali, ti invita a immaginare la tua avventura.',
      intro:
        'Tra paesaggi vari, fauna particolare e una cultura ricca, l’isola offre molti modi di viaggiare. I circuiti presentati mostrano alcune possibilità e possono ispirare un itinerario secondo i tuoi interessi. Sarò felice di aiutarti a scegliere tappe e ritmo più adatti.',
      metaTitle: 'Idee di viaggio in Madagascar | Anabo Roadtrip',
      metaDescription:
        'Scopri idee di viaggio in Madagascar: RN7, Tsingy, baobab, parchi, costa orientale e Nosy Be con un autista-guida locale.',
      keywords: ['idee viaggio Madagascar', 'itinerario Madagascar', 'road trip Madagascar', 'tour RN7 Madagascar', 'tour Nosy Be', 'autista-guida Madagascar'],
      faqTitle: 'Domande per scegliere un circuito in Madagascar',
      faqs: [
        ['Quali circuiti si possono fare in Madagascar?', 'Le proposte includono la RN7 e il Sud, gli Tsingy e i baobab, i parchi dell’Est, il Nord e Nosy Be, oltre agli Altipiani centrali.'],
        ['Come scelgo un itinerario adatto al mio viaggio?', 'Considera la durata, le regioni desiderate, la stagione e le condizioni stradali. Puoi discutere il percorso e le tappe con un autista-guida locale.'],
        ['I circuiti suggeriti si possono personalizzare?', 'Sì. Le proposte sono un punto di partenza: tappe e ritmo possono essere adattati e confermati in base alla disponibilità e alle condizioni locali.'],
      ],
    },
    tourDescriptions: {
      'sud-et-rn7': 'Unisci cultura e natura lungo la celebre RN7, tra campi verdi, terra rossa, cielo blu e mare turchese.',
      'baobab-et-tsingy': 'Scopri l’autentico Sud-Ovest: Morondava, il fiume Tsiribihina, gli Tsingy e il celebre Viale dei Baobab.',
      'lemuriens-et-circuit-vers-l-est': 'Esplora il parco nazionale di Andasibe e la foresta tropicale, habitat di lemuri, camaleonti e piante endemiche.',
      'circuit-safari-en-voiture': 'Esplora parchi nazionali e riserve per scoprire fauna, flora e paesaggi del Madagascar.',
      'cote-est-et-lemuriens': 'Raggiungi Sainte-Marie da Antananarivo passando per Andasibe, il canale di Pangalanes e la costa orientale.',
      'voyage-hors-route-et-baobabs': 'Un’avventura tra piste costiere del Sud-Ovest, Tsiribihina, Tsingy, baobab e RN7.',
      'ampefy-et-la-campagne': 'Scopri il lago Itasy, la cascata Lily e la campagna Merina ad Ampefy con i tuoi ritmi.',
      'train-manakara': 'Viaggia in treno da Fianarantsoa a Manakara attraverso i paesaggi lussureggianti della costa orientale.',
      'circuit-nord-et-nosibe': 'Raggiungi Nosy Be tra parchi e paesaggi del Nord, spiagge e incontri locali.',
    },
    tourImageAlts: {
      'sud-et-rn7': 'Paesaggi colorati lungo la RN7 in Madagascar',
      'baobab-et-tsingy': 'Viale dei Baobab al tramonto',
      'lemuriens-et-circuit-vers-l-est': 'Indri indri nella foresta del Madagascar',
      'circuit-safari-en-voiture': 'Fossa del Madagascar',
      'cote-est-et-lemuriens': 'Canale di Pangalanes sulla costa orientale',
      'voyage-hors-route-et-baobabs': 'Viale dei Baobab durante un road trip nel Grande Sud',
      'ampefy-et-la-campagne': 'Cascata Lily nella regione di Ampefy',
      'train-manakara': 'Treno tra Fianarantsoa e Manakara',
      'circuit-nord-et-nosibe': 'Spiaggia di Nosy Be in Madagascar',
    },
  },
}

function portableText(paragraphs, prefix) {
  return paragraphs.map((text, index) => ({
    _key: `${prefix}-${index + 1}`,
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

function faqModule(data, locale, key = 'text-utile-ai-search') {
  return {
    _key: key,
    _type: 'faqBlock',
    title: data.faqTitle,
    titleFont: 'font-serif',
    titleColor: 'navy',
    titleSize: 'lg',
    items: data.faqs.map(([question, answer], index) => ({
      _key: `${locale}-search-question-${index + 1}`,
      _type: 'faqItem',
      question,
      answer: portableText([answer], `${locale}-search-answer-${index + 1}`),
    })),
  }
}

function referenceImage(assetId, alt) {
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: assetId },
    alt,
  }
}

function getAssetId(image) {
  return image?.asset?._id || image?.asset?._ref
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

const targetSlugs = ['about-us', 'trip-guidelines', 'madagascar', 'contact']
const pages = await client.fetch(
  `*[_type == "page" && slug.current in $slugs]{
    _id, _rev, title, language, pageType, translationGroup, "slug": slug.current,
    excerpt, seo, modules[]{...}
  }`,
  { slugs: targetSlugs },
)
const pageMap = new Map(pages.map((page) => [`${page.language}:${page.slug}`, page]))

for (const slug of targetSlugs) {
  for (const locale of ['fr', 'en', 'it']) {
    if (!pageMap.has(`${locale}:${slug}`)) {
      throw new Error(`Page existante manquante dans Sanity : ${locale}/${slug}.`)
    }
  }
}

const sourceMadagascar = pageMap.get('fr:madagascar')
const sourceImages = sourceMadagascar.modules
  .filter((module) => module._type === 'textMediaBlock' && getAssetId(module.image))
  .map((module) => module.image)
if (sourceImages.length < 2) {
  throw new Error('Images existantes de la page Madagascar introuvables.')
}

const updates = []
for (const locale of ['fr', 'en', 'it']) {
  const localized = content[locale]
  const aboutPage = pageMap.get(`${locale}:about-us`)
  const guidelinesPage = pageMap.get(`${locale}:trip-guidelines`)
  const madagascarPage = pageMap.get(`${locale}:madagascar`)
  const contactPage = pageMap.get(`${locale}:contact`)

  const oldAboutHero = aboutPage.modules.find((module) => module._type === 'heroBlock')
  if (!getAssetId(oldAboutHero?.backgroundImage)) {
    throw new Error(`Image de couverture de la page À propos manquante (${locale}).`)
  }
  const oldMadagascarHero = madagascarPage.modules.find((module) => module._type === 'heroBlock')
  const oldContactForm = contactPage.modules.find((module) => module._type === 'contactFormBlock')
  if (!oldContactForm) {
    throw new Error(`Bloc formulaire de la page contact manquant (${locale}).`)
  }

  const about = localized.about
  const aboutModules = [
    {
      ...oldAboutHero,
      _key: 'text-utile-about-hero',
      title: about.hero,
      subtitle: about.heroSubtitle,
      height: oldAboutHero.height || 'standard',
      alignment: oldAboutHero.alignment || 'center',
    },
    {
      _key: 'text-utile-about-philosophy',
      _type: 'headingBlock',
      title: locale === 'fr' ? 'Ma philosophie' : locale === 'en' ? 'My philosophy' : 'La mia filosofia',
      subtitle: about.philosophy,
      titleFont: 'font-serif',
      titleColor: 'navy',
      titleSize: 'lg',
      titleWeight: 'font-bold',
      subtitleFont: 'font-script',
      subtitleColor: 'gold',
      subtitleSize: 'md',
      alignment: 'center',
    },
    {
      _key: 'text-utile-about-welcome',
      _type: 'textMediaBlock',
      title: locale === 'fr' ? 'Salama, bienvenue' : locale === 'en' ? 'Salama, welcome' : 'Salama, benvenuti',
      content: portableText(about.welcome, `${locale}-about-welcome`),
      image: referenceImage(
        getAssetId(sourceImages[0]),
        localized.madagascar.sections[0].alt,
      ),
      imagePosition: 'right',
      imageSize: 'md',
    },
    {
      _key: 'text-utile-about-commitments',
      _type: 'commitmentsBlock',
      title: locale === 'fr' ? 'Nos engagements' : locale === 'en' ? 'Our commitments' : 'I nostri impegni',
      titleFont: 'font-serif',
      titleColor: 'navy',
      titleWeight: 'font-bold',
      sections: about.commitments.map((section, sectionIndex) => ({
        _key: `${locale}-commitment-section-${sectionIndex + 1}`,
        _type: 'commitmentSection',
        title: section.title,
        items: section.items.map((item, itemIndex) => ({
          _key: `${locale}-commitment-${sectionIndex + 1}-${itemIndex + 1}`,
          _type: 'commitmentItem',
          ...item,
        })),
      })),
    },
    {
      _key: 'text-utile-about-local',
      _type: 'textMediaBlock',
      title: locale === 'fr' ? 'Privilégier le local' : locale === 'en' ? 'Choose local' : 'Scegliere il locale',
      content: portableText(about.local, `${locale}-about-local`),
      image: referenceImage(
        getAssetId(sourceImages[1]),
        localized.madagascar.sections[1].alt,
      ),
      imagePosition: 'left',
      imageSize: 'md',
    },
    {
      _key: 'text-utile-about-sustainable',
      _type: 'textMediaBlock',
      title: locale === 'fr' ? 'Opter pour un tourisme durable' : locale === 'en' ? 'Choose more sustainable travel' : 'Scegliere un turismo sostenibile',
      content: portableText(about.sustainable, `${locale}-about-sustainable`),
      imagePosition: 'right',
      imageSize: 'md',
    },
    faqModule(about, locale),
  ]

  const guidelines = localized.guidelines
  const oldGuidelinesHero = guidelinesPage.modules.find((module) => module._type === 'heroBlock')
  const guidelinesModules = [
    {
      ...(oldGuidelinesHero || {}),
      _key: 'text-utile-guidelines-hero',
      _type: 'heroBlock',
      title: guidelines.hero,
      subtitle: guidelines.intro,
      height: oldGuidelinesHero?.height || 'compact',
      alignment: oldGuidelinesHero?.alignment || 'center',
    },
    ...guidelines.sections.map((section, index) => ({
      _key: `text-utile-guidelines-${index + 1}`,
      _type: 'textMediaBlock',
      title: section.title,
      content: portableText(section.paragraphs, `${locale}-guidelines-${index + 1}`),
      imagePosition: index % 2 === 0 ? 'right' : 'left',
      imageSize: 'md',
    })),
    faqModule(guidelines, locale),
  ]

  const madagascar = localized.madagascar
  const madagascarModules = [
    {
      ...(oldMadagascarHero || {}),
      _key: 'text-utile-madagascar-hero',
      _type: 'heroBlock',
      title: madagascar.hero,
      subtitle: madagascar.heroSubtitle,
      height: oldMadagascarHero?.height || 'standard',
      alignment: oldMadagascarHero?.alignment || 'center',
    },
    ...madagascar.sections.map((section, index) => ({
      _key: `text-utile-madagascar-${index + 1}`,
      _type: 'textMediaBlock',
      title: section.title,
      content: portableText(section.paragraphs, `${locale}-madagascar-${index + 1}`),
      ...(section.imageIndex === undefined
        ? {}
        : {
            image: referenceImage(
              getAssetId(sourceImages[section.imageIndex]),
              section.alt,
            ),
            imagePosition: index % 2 === 0 ? 'right' : 'left',
            imageSize: 'md',
          }),
    })),
    faqModule(madagascar, locale),
  ]

  const contact = localized.contact
  const contactModules = [
    {
      _key: 'text-utile-contact-hero',
      _type: 'heroBlock',
      title: contact.hero,
      subtitle: contact.introTitle,
      height: 'compact',
      alignment: 'center',
    },
    {
      _key: 'text-utile-contact-intro',
      _type: 'textMediaBlock',
      title: contact.introTitle,
      content: portableText(contact.intro, `${locale}-contact-intro`),
    },
    {
      ...oldContactForm,
      _key: 'text-utile-contact-form',
      title: contact.formTitle,
      description: contact.formDescription,
    },
    faqModule(contact, locale),
  ]

  const pagesForLocale = [
    {
      page: aboutPage,
      data: {
        title: about.title,
        translationGroup: 'about-us',
        excerpt: about.excerpt,
        seo: { ...aboutPage.seo, _type: 'seoFields', metaTitle: about.seo.title, metaDescription: about.seo.description, keywords: about.seo.keywords },
        modules: aboutModules,
      },
    },
    {
      page: guidelinesPage,
      data: {
        title: guidelines.title,
        translationGroup: 'trip-guidelines',
        excerpt: guidelines.excerpt,
        seo: { ...guidelinesPage.seo, _type: 'seoFields', metaTitle: guidelines.seo.title, metaDescription: guidelines.seo.description, keywords: guidelines.seo.keywords },
        modules: guidelinesModules,
      },
    },
    {
      page: madagascarPage,
      data: {
        title: madagascar.title,
        excerpt: madagascar.excerpt,
        seo: { ...madagascarPage.seo, _type: 'seoFields', metaTitle: madagascar.seo.title, metaDescription: madagascar.seo.description, keywords: madagascar.seo.keywords },
        modules: madagascarModules,
      },
    },
    {
      page: contactPage,
      data: {
        title: contact.title,
        translationGroup: 'contact',
        excerpt: contact.excerpt,
        seo: { ...contactPage.seo, _type: 'seoFields', metaTitle: contact.seo.title, metaDescription: contact.seo.description, keywords: contact.seo.keywords },
        modules: contactModules,
      },
    },
  ]

  for (const { page, data } of pagesForLocale) {
    const seo = data.seo
    if (seo.metaTitle.length > 60 || seo.metaDescription.length > 160) {
      throw new Error(`Titre ou description SEO trop long : ${page.slug} (${locale}).`)
    }
    updates.push({ page, data })
  }

  const circuitPages = await client.fetch(
    `*[_type == "page" && pageType == "circuit" && language == $locale]{
      _id, _rev, title, language, translationGroup, "slug": slug.current, excerpt, seo,
      featuredImage{..., asset->{_id}},
      modules[]{...}
    }`,
    { locale },
  )
  const tourTexts = localized.tourDescriptions
  for (const [slug, excerpt] of Object.entries(tourTexts)) {
    const page = circuitPages.find((candidate) => candidate.slug === slug)
    if (!page) throw new Error(`Page de circuit manquante : ${locale}/${slug}.`)
    const seoTitle = page.title.slice(0, 60)
    const keywords = [
      page.title,
      locale === 'fr'
        ? 'circuit Madagascar'
        : locale === 'en'
          ? 'Madagascar tour'
          : 'tour Madagascar',
      locale === 'fr'
        ? 'chauffeur-guide Madagascar'
        : locale === 'en'
          ? 'Madagascar driver-guide'
          : 'autista-guida Madagascar',
      locale === 'fr'
        ? 'voyage Madagascar'
        : locale === 'en'
          ? 'Madagascar travel'
          : 'viaggio Madagascar',
    ]
    const modules = (page.modules || []).map((module) => {
      if (module._key === 'tour-import-hero') {
        return { ...module, subtitle: excerpt }
      }
      if (module._key === 'tour-import-tagline' && module.title) {
        return module
      }
      return module
    })
    updates.push({
      page,
      data: {
        excerpt,
        seo: {
          ...page.seo,
          _type: 'seoFields',
          metaTitle: seoTitle,
          metaDescription: excerpt,
          keywords,
        },
        ...(getAssetId(page.featuredImage)
          ? {
              featuredImage: {
                ...page.featuredImage,
                asset: {
                  _type: 'reference',
                  _ref: getAssetId(page.featuredImage),
                },
                alt: localized.tourImageAlts[slug],
              },
            }
          : {}),
        modules,
      },
    })
  }
}

const missing = updates.filter(({ page }) => !page?._id)
if (missing.length) throw new Error('Pages manquantes : transaction annulée.')

const duplicateIds = new Set()
for (const update of updates) {
  if (duplicateIds.has(update.page._id)) {
    throw new Error(`Page sélectionnée plusieurs fois : ${update.page._id}`)
  }
  duplicateIds.add(update.page._id)
}

console.log(`Mode : ${isApply ? 'écriture Sanity' : 'simulation sans écriture'}`)
console.log(`Pages existantes concernées : ${updates.length} (pages éditoriales et circuits en trois langues).`)
for (const { page, data } of updates) {
  console.log(`- [${page.language}] /${page.slug} : ${data.modules ? `${data.modules.length} bloc(s)` : 'métadonnées'}, SEO et résumé`)
}
console.log('La page /tour-ideas sera complétée dans les messages localisés du site.')

if (!isApply) {
  console.log('\nAucun document Sanity n’a été modifié. Relancez avec --apply pour appliquer le contenu.')
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
