export default {
  name: 'heroBlock',
  title: 'Hero Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Titre principal',
      validation: (Rule: any) => Rule.required(),
    },
    // 👇 NOUVEAU : Police pour le titre principal 👇
    {
      name: 'titleFont',
      type: 'string',
      title: 'Police du Titre',
      description: 'Choisissez la police pour le titre principal.',
      options: {
        list: [
          { title: 'Par défaut (Inter / Sans-serif)', value: 'font-sans' },
          { title: 'Élégante (Playfair / Serif)', value: 'font-serif' },
          { title: 'Manuscrite (Perfect Girl)', value: 'font-script' },
        ],
        layout: 'radio',
      },
      initialValue: 'font-sans',
    },
    { 
      name: 'subtitle', 
      type: 'string', 
      title: 'Sous-titre' 
    },
    // 👇 NOUVEAU : Police pour le sous-titre 👇
    {
      name: 'subtitleFont',
      type: 'string',
      title: 'Police du Sous-titre',
      description: 'Choisissez la police pour le sous-titre.',
      options: {
        list: [
          { title: 'Par défaut (Inter / Sans-serif)', value: 'font-sans' },
          { title: 'Élégante (Playfair / Serif)', value: 'font-serif' },
          { title: 'Manuscrite (Perfect Girl)', value: 'font-script' },
        ],
        layout: 'radio',
      },
      initialValue: 'font-sans',
    },
    {
      name: 'backgroundImage',
      type: 'image',
      title: 'Image de fond',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }],
    },
    {
      name: 'overlay',
      type: 'boolean',
      title: 'Superposition sombre',
      initialValue: true,
    },
    {
      name: 'alignment',
      type: 'string',
      title: 'Alignement',
      options: {
        list: [
          { title: 'Gauche', value: 'left' },
          { title: 'Centre', value: 'center' },
          { title: 'Droite', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'center',
    },
    {
      name: 'ctaPrimary',
      type: 'object',
      title: 'Bouton principal',
      fields: [
        { name: 'label', type: 'string', title: 'Texte' },
        { name: 'link', type: 'string', title: 'Lien' },
      ],
    },
    {
      name: 'ctaSecondary',
      type: 'object',
      title: 'Bouton secondaire',
      fields: [
        { name: 'label', type: 'string', title: 'Texte' },
        { name: 'link', type: 'string', title: 'Lien' },
      ],
    },
  ],
  preview: {
    select: { title: 'title', media: 'backgroundImage' },
    prepare({ title, media }: any) {
      return { title: title || 'Hero Section', subtitle: 'Hero', media }
    },
  },
}