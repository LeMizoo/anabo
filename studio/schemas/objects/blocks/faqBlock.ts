export default {
  name: 'faqBlock',
  title: 'FAQ',
  type: 'object',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Titre',
      initialValue: 'Questions fréquentes',
    },
    {
      name: 'items',
      type: 'array',
      title: 'Questions',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            {
              name: 'question',
              type: 'string',
              title: 'Question',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'answer',
              type: 'array',
              title: 'Réponse',
              of: [{ type: 'block' }],
            },
          ],
          preview: { select: { title: 'question' } },
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: 'FAQ', subtitle: 'Bloc FAQ' }
    },
  },
}
