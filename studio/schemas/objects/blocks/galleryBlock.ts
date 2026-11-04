import { headingTypographyFields } from '../headingTypographyFields'
import { imagePresentationField } from '../imagePresentationField'

export default {
  name: 'galleryBlock',
  title: 'Galerie photos',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre de la galerie' },
    ...headingTypographyFields(),
    {
      name: 'images',
      type: 'array',
      title: 'Images',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Texte alternatif' },
            { name: 'caption', type: 'string', title: 'Légende' },
            imagePresentationField(),
          ],
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
    select: { title: 'title', images: 'images' },
    prepare({ title, images }: any) {
      return {
        title: title || 'Galerie',
        subtitle: `${images?.length || 0} image(s)`,
        media: images?.[0],
      }
    },
  },
}
