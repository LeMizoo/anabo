
import { headingTypographyFields } from '../headingTypographyFields'
import { imagePresentationField } from '../imagePresentationField'

export default {
  name: 'heroBlock',
  title: 'Hero Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Titre principal',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'subtitle',
      type: 'string',
      title: 'Sous-titre',
    },
    ...headingTypographyFields({ subtitle: true, titleFont: 'font-sans', subtitleFont: 'font-sans' }),
    {
      name: 'backgroundImage',
      type: 'image',
      title: 'Image de fond',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Texte alternatif' },
        imagePresentationField({ radius: 'none', shadow: 'none' }),
      ],
    },
    {
      name: 'backgroundImagePosition',
      type: 'string',
      title: 'Position de l’image de fond',
      options: {
        list: [
          { title: 'Centre', value: 'center' },
          { title: 'Haut', value: 'top' },
          { title: 'Droite', value: 'right' },
          { title: 'Bas', value: 'bottom' },
          { title: 'Gauche', value: 'left' },
        ],
        layout: 'radio',
      },
      initialValue: 'center',
    },
    {
      name: 'backgroundImageFit',
      type: 'string',
      title: 'Ajustement de l’image',
      options: {
        list: [
          { title: 'Remplir la section', value: 'cover' },
          { title: 'Afficher toute l’image', value: 'contain' },
        ],
        layout: 'radio',
      },
      initialValue: 'cover',
    },
    {
      name: 'overlay',
      type: 'boolean',
      title: 'Superposition sombre',
      initialValue: true,
    },
    {
      name: 'alignment',
      type: 'string',
      title: 'Alignement',
      options: {
        list: [
          { title: 'Gauche', value: 'left' },
          { title: 'Centre', value: 'center' },
          { title: 'Droite', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'center',
    },
    {
      name: 'ctaPrimary',
      type: 'object',
      title: 'Bouton principal',
      fields: [
        { name: 'label', type: 'string', title: 'Texte' },
        { name: 'link', type: 'string', title: 'Lien' },
      ],
    },
    {
      name: 'ctaSecondary',
      type: 'object',
      title: 'Bouton secondaire',
      fields: [
        { name: 'label', type: 'string', title: 'Texte' },
        { name: 'link', type: 'string', title: 'Lien' },
      ],
    },
    {
      name: 'settings',
      type: 'blockSettings',
      title: 'Réglages de la section',
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'backgroundImage',
    },
    prepare({ title, media }: any) {
      return {
        title: title || 'Hero Section',
        subtitle: 'Hero',
        media,
      }
    },
  },
}
