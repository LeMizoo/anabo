export default {
  name: 'testimonial',
  title: 'Témoignage',
  type: 'document',
  fields: [
    {
      name: 'authorName',
      type: 'string',
      title: 'Nom du client',
      validation: (Rule: any) => Rule.required(),
    },
    { name: 'authorCountry', type: 'string', title: 'Pays' },
    {
      name: 'authorPhoto',
      type: 'image',
      title: 'Photo',
      options: { hotspot: true },
    },
    {
      name: 'content',
      type: 'text',
      title: 'Témoignage',
      rows: 4,
      validation: (Rule: any) => Rule.required().min(20),
    },
    {
      name: 'rating',
      type: 'number',
      title: 'Note (1-5)',
      initialValue: 5,
      validation: (Rule: any) => Rule.min(1).max(5).integer(),
    },
    { name: 'date', type: 'date', title: 'Date' },
    {
      name: 'source',
      type: 'string',
      title: 'Source',
      options: {
        list: [
          { title: 'TripAdvisor', value: 'TripAdvisor' },
          { title: 'Google', value: 'Google' },
          { title: 'Direct', value: 'Direct' },
        ],
      },
      initialValue: 'TripAdvisor',
    },
    {
      name: 'featured',
      type: 'boolean',
      title: '⭐ Mettre en avant',
      initialValue: false,
    },
  ],
  preview: {
    select: { title: 'authorName', subtitle: 'content', media: 'authorPhoto' },
    prepare({ title, subtitle, media }: any) {
      return {
        title: title || 'Témoignage',
        subtitle: subtitle?.substring(0, 50) + '...',
        media,
      }
    },
  },
}
