import { headingTypographyFields } from '../headingTypographyFields'

const weightOptions = [
  { title: 'Fin', value: 'font-normal' },
  { title: 'Moyen', value: 'font-medium' },
  { title: 'Semi-gras', value: 'font-semibold' },
  { title: 'Gras', value: 'font-bold' },
]

export default {
  name: 'headingBlock',
  title: 'Titre et sous-titre',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre' },
    { name: 'subtitle', type: 'text', title: 'Sous-titre', rows: 3 },
    ...headingTypographyFields({ subtitle: true }),
    {
      name: 'titleWeight',
      type: 'string',
      title: 'Graisse du titre',
      options: { list: weightOptions, layout: 'radio' },
      initialValue: 'font-bold',
    },
    {
      name: 'subtitleWeight',
      type: 'string',
      title: 'Graisse du sous-titre',
      options: { list: weightOptions, layout: 'radio' },
      initialValue: 'font-normal',
    },
    {
      name: 'alignment',
      type: 'string',
      title: 'Alignement',
      options: {
        list: [
          { title: 'À gauche', value: 'left' },
          { title: 'Centré', value: 'center' },
          { title: 'À droite', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'center',
    },
    {
      name: 'settings',
      type: 'blockSettings',
      title: 'Réglages de la section',
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'subtitle' },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return {
        title: title || 'Titre et sous-titre',
        subtitle: subtitle || 'Bloc de titres',
      }
    },
  },
}
