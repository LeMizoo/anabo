import { headingTypographyFields } from '../headingTypographyFields'

export default {
  name: 'commitmentsBlock',
  title: 'Engagements (Listes)',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre principal (ex: Nos engagements)' },
    ...headingTypographyFields({ subtitle: true }),
    {
      name: 'titleWeight',
      type: 'string',
      title: 'Graisse du titre',
      options: {
        list: [
          { title: 'Normal', value: 'font-normal' },
          { title: 'Gras (Bold)', value: 'font-bold' },
        ],
        layout: 'radio',
      },
      initialValue: 'font-bold',
    },
    { name: 'subtitle', type: 'string', title: 'Sous-titre manuscrit (ex: Salama)' },
    {
      name: 'sections',
      type: 'array',
      title: 'Sections d\'engagement',
      of: [
        {
          name: 'commitmentSection',
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Titre de la section (ex: CONNAISSANCES LOCALES)' },
            {
              name: 'items',
              type: 'array',
              title: 'Points',
              of: [
                {
                  name: 'commitmentItem',
                  type: 'object',
                  fields: [
                    { name: 'label', type: 'string', title: 'Label en gras (ex: NORMES CULTURELLES)' },
                    { name: 'text', type: 'text', title: 'Texte explicatif' }
                  ],
                  preview: {
                    select: { title: 'label', subtitle: 'text' }
                  }
                }
              ]
            }
          ],
          preview: {
            select: { title: 'title' }
          }
        }
      ]
    },
    {
      name: 'settings',
      type: 'blockSettings',
      title: 'Réglages de la section',
    },
  ]
}