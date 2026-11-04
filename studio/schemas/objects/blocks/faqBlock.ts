import { headingTypographyFields } from '../headingTypographyFields'

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
    ...headingTypographyFields({ titleFont: 'font-serif' }),
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
    {
      name: 'settings',
      type: 'blockSettings',
      title: 'Réglages de la section',
    },
  ],
  preview: {
    prepare() {
      return { title: 'FAQ', subtitle: 'Bloc FAQ' }
    },
  },
}
