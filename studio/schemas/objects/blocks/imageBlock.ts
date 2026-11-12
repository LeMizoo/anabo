import type { ElementType, ReactNode } from 'react'
import { imagePresentationField } from '../imagePresentationField'

export default {
  name: 'imageBlock',
  title: 'Image seule',
  type: 'object',
  fields: [
    {
      name: 'image',
      type: 'image',
      title: 'Image',
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required(),
      fields: [
        { name: 'alt', type: 'string', title: 'Texte alternatif' },
        imagePresentationField(),
      ],
    },
    {
      name: 'scale',
      type: 'string',
      title: 'Échelle de l’image',
      description: 'Largeur de l’image dans le bloc.',
      options: {
        list: [
          { title: '25 %', value: '25' },
          { title: '50 %', value: '50' },
          { title: '75 %', value: '75' },
          { title: '100 %', value: '100' },
        ],
        layout: 'radio',
      },
      initialValue: '100',
    },
    {
      name: 'crop',
      type: 'string',
      title: 'Recadrage',
      description: 'Choisissez un format. Le cadrage « Remplir le cadre » applique le recadrage.',
      options: {
        list: [
          { title: 'Original (sans recadrage)', value: 'original' },
          { title: 'Carré (1:1)', value: 'square' },
          { title: 'Paysage (16:9)', value: 'landscape' },
          { title: 'Portrait (3:4)', value: 'portrait' },
        ],
        layout: 'radio',
      },
      initialValue: 'original',
    },
    {
      name: 'settings',
      type: 'blockSettings',
      title: 'Réglages de la section',
    },
  ],
  preview: {
    select: { media: 'image', alt: 'image.alt' },
    prepare({
      media,
      alt,
    }: {
      media?: ReactNode | ElementType
      alt?: string
    }): {
      title: string
      subtitle: string
      media?: ReactNode | ElementType
    } {
      return {
        title: alt || 'Image seule',
        subtitle: 'Bloc image',
        media,
      }
    },
  },
}
