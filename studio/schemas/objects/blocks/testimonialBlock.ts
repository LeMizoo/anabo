export default {
  name: 'testimonialBlock',
  title: 'Témoignages',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre de la section' },
    {
      name: 'testimonials',
      type: 'array',
      title: 'Témoignages',
      of: [{ type: 'reference', to: [{ type: 'testimonial' }] }],
    },
    {
      name: 'layout',
      type: 'string',
      title: 'Disposition',
      options: {
        list: [
          { title: 'Carousel', value: 'carousel' },
          { title: 'Grille', value: 'grid' },
        ],
        layout: 'radio',
      },
      initialValue: 'carousel',
    },
  ],
  preview: {
    prepare() {
      return { title: 'Témoignages', subtitle: 'Bloc témoignages' }
    },
  },
}
