import { defineField } from 'sanity'
import { isUniqueOtherThanLanguage } from '../../lib/isUniqueOtherThanLanguage'

export default {
  name: 'page',
  title: 'Page',
  type: 'document',
  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Titre',
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'URL',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: isUniqueOtherThanLanguage,
      },
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'language',
      type: 'string',
      title: 'Langue',
      description:
        'Langue de cette version de la page. Chaque langue a son propre document, relié aux autres via le champ « Groupe de traduction ».',
      options: {
        list: [
          { title: '🇫🇷 Français', value: 'fr' },
          { title: '🇬🇧 English', value: 'en' },
          { title: '🇮🇹 Italiano', value: 'it' },
        ],
        layout: 'radio',
      },
      initialValue: 'fr',
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'translationGroup',
      type: 'string',
      title: 'Groupe de traduction',
      description:
        'Identifiant partagé par toutes les versions linguistiques de la même page. Exemple : « madagascar » pour les documents fr, en et it de la page Madagascar. Doit être identique dans les trois documents.',
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'pageType',
      type: 'string',
      title: 'Type de page',
      options: {
        list: [
          { title: '🏠 Accueil', value: 'home' },
          { title: '🗺️ Circuit', value: 'circuit' },
          { title: '✈️ Sur-mesure', value: 'custom-trip' },
          { title: '👥 À propos', value: 'about' },
          { title: '📞 Contact', value: 'contact' },
          { title: '❓ FAQ', value: 'faq' },
          { title: '📄 Autre', value: 'other' },
        ],
        layout: 'radio',
      },
      initialValue: 'other',
      group: 'content',
    },
    {
      name: 'featuredImage',
      type: 'image',
      title: 'Image principale',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }],
      group: 'content',
    },
    {
      name: 'excerpt',
      type: 'text',
      title: 'Résumé',
      rows: 3,
      group: 'content',
    },
    {
      name: 'cardTagline',
      type: 'string',
      title: 'Accroche de la carte circuit',
      description: 'Courte accroche affichée sur la carte du circuit dans la liste des voyages.',
      hidden: ({ document }: any) => document?.pageType !== 'circuit',
      group: 'content',
    },
    defineField({
      name: 'routeStops',
      type: 'array',
      title: 'Étapes de l’itinéraire',
      description:
        'Visible pour les circuits et voyages sur mesure. Ajoutez les lieux dans l’ordre réel du trajet. Au moins deux étapes sont nécessaires pour afficher la carte.',
      hidden: ({ document }: any) =>
        document?.pageType !== 'circuit' && document?.pageType !== 'custom-trip',
      of: [
        {
          type: 'string',
          validation: (Rule) => Rule.required().min(2),
        },
      ],
      validation: (Rule) =>
        Rule.custom((stops: any) => {
          if (!Array.isArray(stops) || stops.length === 0) return true
          if (stops.length < 2) return 'Ajoutez au moins deux étapes pour définir un itinéraire.'
          if (stops.some((stop: any) => typeof stop !== 'string' || stop.trim().length < 2)) {
            return 'Chaque étape doit contenir un nom de lieu précis.'
          }
          return true
        }),
      group: 'content',
    }),
    defineField({
      name: 'totalDays',
      type: 'number',
      title: 'Nombre total de jours du circuit',
      description:
        'Durée totale de référence du circuit. Le calcul du tarif utilise la somme des jours renseignés dans « Jours par escale ». Ce total sert à vérifier la cohérence du programme.',
      hidden: ({ document }: any) =>
        document?.pageType !== 'circuit' && document?.pageType !== 'custom-trip',
      validation: (Rule) => Rule.integer().min(1).max(60),
      group: 'content',
    }),
    defineField({
      name: 'stopDays',
      type: 'array',
      title: 'Jours par escale',
      description:
        'Renseignez chaque escale du programme et le nombre de jours passés sur place. La somme de ces jours sera utilisée pour calculer le prix du véhicule.',
      hidden: ({ document }: any) =>
        document?.pageType !== 'circuit' && document?.pageType !== 'custom-trip',
      of: [
        {
          type: 'object',
          name: 'stopDay',
          fields: [
            {
              name: 'place',
              type: 'string',
              title: 'Escale',
              validation: (Rule) => Rule.required().min(2),
            },
            {
              name: 'days',
              type: 'number',
              title: 'Nombre de jours',
              initialValue: 1,
              validation: (Rule) => Rule.required().integer().min(1).max(30),
            },
          ],
          preview: {
            select: { title: 'place', days: 'days' },
            prepare({ title, days }: { title?: string; days?: number }) {
              return {
                title: title || 'Escale',
                subtitle: days ? `${days} jour${days > 1 ? 's' : ''}` : '',
              }
            },
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom((stops: any, context: any) => {
          if (!Array.isArray(stops) || stops.length === 0) return true

          const sum = (stops as { days?: number }[]).reduce<number>(
            (acc, stop) => acc + (Number(stop.days) || 0),
            0,
          )

          const total = (context.document as { totalDays?: number } | undefined)?.totalDays

          if (total && sum !== total) {
            return `La somme des jours par escale (${sum}) ne correspond pas au total du circuit (${total}).`
          }

          return true
        }).warning(),
      group: 'content',
    }),
    {
      name: 'modules',
      type: 'array',
      title: 'Blocs de contenu',
      of: [
        { type: 'heroBlock' },
        { type: 'textMediaBlock' },
        { type: 'galleryBlock' },
        { type: 'testimonialBlock' },
        { type: 'tripadvisorBlock' },
        { type: 'ctaBlock' },
        { type: 'faqBlock' },
        { type: 'contactFormBlock' },
        { type: 'customQuoteBlock' },
        { type: 'slider3dBlock' },
        { type: 'puzzleGalleryBlock' },
        { type: 'alternatingBlock' },
        { type: 'featuresBlock' },
        { type: 'commitmentsBlock' },
        { type: 'imageBlock' },
        { type: 'imageMarqueeBlock' },
        { type: 'headingBlock' },
        { type: 'cardsBlock' },
      ],
      group: 'content',
    },
    {
      name: 'seo',
      type: 'seoFields',
      title: 'SEO',
      group: 'seo',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'pageType',
      language: 'language',
      media: 'featuredImage',
    },
    prepare(selection: any) {
      const { title, subtitle, language } = selection
      const langLabel =
        language === 'fr'
          ? '🇫🇷 FR'
          : language === 'en'
            ? '🇬🇧 EN'
            : language === 'it'
              ? '🇮🇹 IT'
              : '—'
      return {
        title: title,
        subtitle: `${langLabel} · ${subtitle || ''}`,
        media: selection.media,
      }
    },
  },
}