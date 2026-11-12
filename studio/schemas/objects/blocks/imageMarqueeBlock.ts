import { headingTypographyFields } from '../headingTypographyFields'
import { imagePresentationField } from '../imagePresentationField'

export default {
  name: 'imageMarqueeBlock',
  title: 'Défilement d’images',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre de la section' },
    ...headingTypographyFields(),
    {
      name: 'images',
      type: 'array',
      title: 'Images',
      validation: (Rule: any) => Rule.min(1),
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Texte alternatif' },
            imagePresentationField(),
          ],
        },
      ],
    },
    {
      name: 'duration',
      type: 'number',
      title: 'Durée du cycle (secondes)',
      description: 'Une durée plus longue ralentit le défilement.',
      initialValue: 30,
      validation: (Rule: any) => Rule.min(5).max(120),
    },
    {
      name: 'settings',
      type: 'blockSettings',
      title: 'Réglages de la section',
    },
  ],
  preview: {
    select: { title: 'title', images: 'images' },
    prepare({ title, images }: any) {
      return {
        title: title || 'Défilement d’images',
        subtitle: `${images?.length || 0} image(s) · boucle horizontale`,
        media: images?.[0],
      }
    },
  },
}
