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
    { name: 'subtitle', type: 'string', title: 'Sous-titre' },
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
