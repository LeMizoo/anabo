
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
    ...headingTypographyFields({ subtitle: true }),
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
      name: 'backgroundImageMotion',
      type: 'string',
      title: 'Mouvement de l’image',
      options: {
        list: [
          { title: 'Aucun', value: 'none' },
          { title: 'Panoramique vers la gauche', value: 'pan-left' },
          { title: 'Panoramique vers la droite', value: 'pan-right' },
          { title: 'Panoramique vers le haut', value: 'pan-up' },
          { title: 'Panoramique vers le bas', value: 'pan-down' },
          { title: 'Zoom lent', value: 'ken-burns' },
        ],
        layout: 'radio',
      },
      initialValue: 'none',
    },
    {
      name: 'backgroundImageMotionDuration',
      type: 'number',
      title: 'Durée du mouvement de l’image (secondes)',
      description: 'Durée d’un mouvement complet. Valeur conseillée : 20 secondes.',
      initialValue: 20,
      validation: (Rule: any) => Rule.min(8).max(60),
    },
    {
      name: 'contentAnimation',
      type: 'string',
      title: 'Animation du contenu',
      options: {
        list: [
          { title: 'Aucune', value: 'none' },
          { title: 'Fondu', value: 'fade-in' },
          { title: 'Apparition vers le haut', value: 'fade-up' },
          { title: 'Entrée depuis la gauche', value: 'slide-left' },
          { title: 'Entrée depuis la droite', value: 'slide-right' },
        ],
        layout: 'radio',
      },
      initialValue: 'fade-up',
    },
    {
      name: 'height',
      type: 'string',
      title: 'Hauteur du Hero',
      options: {
        list: [
          { title: 'Compacte', value: 'compact' },
          { title: 'Standard', value: 'standard' },
          { title: 'Haute', value: 'tall' },
          { title: 'Plein écran', value: 'screen' },
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
    },
    {
      name: 'overlay',
      type: 'boolean',
      title: 'Superposition sombre',
      initialValue: true,
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      title: 'Intensité de la superposition (%)',
      description: '0 % = transparente, 80 % = très sombre.',
      initialValue: 45,
      validation: (Rule: any) => Rule.min(0).max(80),
      hidden: ({ parent }: { parent?: { overlay?: boolean } }) => parent?.overlay === false,
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
