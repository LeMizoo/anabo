export default {
  name: 'commitmentsBlock',
  title: 'Engagements (Listes)',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre principal (ex: Nos engagements)' },
    {
      name: 'titleFont',
      type: 'string',
      title: 'Police du titre',
      options: {
        list: [
          { title: 'Playfair (Serif)', value: 'font-serif' },
          { title: 'Perfect Girl Sans Serif', value: 'font-perfect-sans' },
          { title: 'Perfect Girl Script', value: 'font-script' },
        ],
        layout: 'radio',
      },
      initialValue: 'font-serif',
    },
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
      name: 'subtitleFont',
      type: 'string',
      title: 'Police du sous-titre',
      options: {
        list: [
          { title: 'Perfect Girl Script (Manuscrite)', value: 'font-script' },
          { title: 'Perfect Girl Sans Serif (Moderne)', value: 'font-perfect-sans' },
          { title: 'Playfair (Serif)', value: 'font-serif' },
        ],
        layout: 'radio',
      },
      initialValue: 'font-script',
    },
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
    }
  ]
}