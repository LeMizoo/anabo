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
      options: { source: 'title', maxLength: 96 },
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
