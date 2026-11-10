import { headingTypographyFields } from '../headingTypographyFields'
import { imagePresentationField } from '../imagePresentationField'

export default {
  name: 'cardsBlock',
  title: 'Cartes image + texte',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre de la section' },
    ...headingTypographyFields(),
    {
      name: 'description',
      type: 'text',
      title: 'Texte d’introduction',
      rows: 3,
    },
    {
      name: 'cards',
      type: 'array',
      title: 'Cartes',
      of: [
        {
          name: 'card',
          type: 'object',
          title: 'Carte',
          fields: [
            {
              name: 'image',
              type: 'image',
              title: 'Image',
              options: { hotspot: true },
              fields: [
                { name: 'alt', type: 'string', title: 'Texte alternatif' },
                imagePresentationField(),
              ],
            },
            { name: 'title', type: 'string', title: 'Titre' },
            ...headingTypographyFields(),
            {
              name: 'description',
              type: 'text',
              title: 'Texte',
              rows: 4,
            },
            {
              name: 'cta',
              type: 'object',
              title: 'Bouton (optionnel)',
              fields: [
                { name: 'label', type: 'string', title: 'Texte du bouton' },
                { name: 'link', type: 'string', title: 'Lien' },
              ],
            },
          ],
          preview: {
            select: { title: 'title', media: 'image' },
            prepare({ title, media }: { title?: string; media?: unknown }) {
              return { title: title || 'Carte', media }
            },
          },
        },
      ],
      validation: (Rule: any) => Rule.min(1),
    },
    {
      name: 'columns',
      type: 'string',
      title: 'Nombre de colonnes',
      options: {
        list: [
          { title: '2 colonnes', value: '2' },
          { title: '3 colonnes', value: '3' },
          { title: '4 colonnes', value: '4' },
        ],
        layout: 'radio',
      },
      initialValue: '3',
    },
    {
      name: 'imagePosition',
      type: 'string',
      title: 'Position des images',
      options: {
        list: [
          { title: 'En haut', value: 'top' },
          { title: 'En bas', value: 'bottom' },
        ],
        layout: 'radio',
      },
      initialValue: 'top',
    },
    {
      name: 'textAlignment',
      type: 'string',
      title: 'Alignement du texte',
      options: {
        list: [
          { title: 'À gauche', value: 'left' },
          { title: 'Au centre', value: 'center' },
          { title: 'À droite', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    },
    {
      name: 'cardStyle',
      type: 'string',
      title: 'Style des cartes',
      options: {
        list: [
          { title: 'Simple', value: 'simple' },
          { title: 'Avec bordure', value: 'bordered' },
          { title: 'Avec ombre', value: 'shadow' },
        ],
        layout: 'radio',
      },
      initialValue: 'shadow',
    },
    {
      name: 'backgroundColor',
      type: 'string',
      title: 'Fond des cartes',
      options: {
        list: [
          { title: 'Blanc', value: 'white' },
          { title: 'Beige', value: 'cream' },
          { title: 'Bleu marine', value: 'navy' },
        ],
        layout: 'radio',
      },
      initialValue: 'white',
    },
    {
      name: 'settings',
      type: 'blockSettings',
      title: 'Réglages de la section',
    },
  ],
  preview: {
    select: { title: 'title', cards: 'cards' },
    prepare({ title, cards }: { title?: string; cards?: unknown[] }) {
      return {
        title: title || 'Cartes image + texte',
        subtitle: `${cards?.length || 0} carte(s)`,
      }
    },
  },
}
