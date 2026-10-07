export default {
  name: 'ctaBlock',
  title: 'Call To Action',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre' },
    { name: 'description', type: 'text', title: 'Description', rows: 2 },
    { name: 'buttonLabel', type: 'string', title: 'Texte du bouton' },
    { name: 'buttonLink', type: 'string', title: 'Lien du bouton' },
    {
      name: 'variant',
      type: 'string',
      title: 'Style',
      options: {
        list: [
          { title: 'Primaire', value: 'primary' },
          { title: 'Secondaire', value: 'secondary' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    },
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }: any) {
      return { title: title || 'Call To Action', subtitle: 'CTA' }
    },
  },
}
