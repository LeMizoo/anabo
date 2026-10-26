export default {
  name: 'slider3dBlock',
  title: 'Slider 3D',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre de la section' },
    {
      name: 'autoplay',
      type: 'boolean',
      title: 'Défilement automatique',
      initialValue: true,
    },
    {
      name: 'interval',
      type: 'number',
      title: 'Délai entre slides (secondes)',
      initialValue: 5,
      validation: (Rule: any) => Rule.min(2).max(20),
    },
    {
      name: 'slides',
      type: 'array',
      title: 'Slides',
      validation: (Rule: any) => Rule.min(3).max(10),
      of: [
        {
          type: 'object',
          name: 'slide',
          fields: [
            {
              name: 'image',
              type: 'image',
              title: 'Image',
              options: { hotspot: true },
              validation: (Rule: any) => Rule.required(),
            },
            { name: 'alt', type: 'string', title: 'Texte alternatif' },
            { name: 'title', type: 'string', title: 'Titre' },
            { name: 'subtitle', type: 'string', title: 'Sous-titre' },
            { name: 'linkLabel', type: 'string', title: 'Texte du lien' },
            {
              name: 'linkUrl',
              type: 'string',
              title: 'Lien',
              description: 'Ex. /fr/madagascar',
            },
          ],
          preview: {
            select: { title: 'title', media: 'image' },
          },
        },
      ],
    },
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }: { title?: string }) {
      return { title: title || 'Slider 3D', subtitle: 'Slider 3D' }
    },
  },
}