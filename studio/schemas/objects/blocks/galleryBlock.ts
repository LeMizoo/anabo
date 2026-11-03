import { headingTypographyFields } from '../headingTypographyFields'
import { imagePresentationField } from '../imagePresentationField'

export default {
  name: 'galleryBlock',
  title: 'Galerie photos',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre de la galerie' },
    ...headingTypographyFields({ titleFont: 'font-serif' }),
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
