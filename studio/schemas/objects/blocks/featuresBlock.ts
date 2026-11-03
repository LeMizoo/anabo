import { headingTypographyFields } from '../headingTypographyFields'

export default {
  name: 'featuresBlock',
  title: 'Grille de fonctionnalités',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre de la section' },
    ...headingTypographyFields({ titleFont: 'font-serif' }),
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
    { name: 'content', type: 'text', title: 'Texte d\'introduction', rows: 3 },
    {
      name: 'features',
      type: 'array',
      title: 'Fonctionnalités',
      of: [{
        name: 'featureItem',
        type: 'object',
        fields: [
          { name: 'title', type: 'string', title: 'Titre de la fonctionnalité' },
          { name: 'description', type: 'text', title: 'Description', rows: 3 },
          { name: 'icon', type: 'string', title: 'Icône (ex: check, shield, map)', initialValue: 'check' }
        ],
        preview: {
          select: { title: 'title', subtitle: 'description' }
        }
      }]
    }
  ]
}