
import { headingTypographyFields } from '../headingTypographyFields'
import { imagePresentationField } from '../imagePresentationField'

export default {
  name: 'alternatingBlock',
  title: 'Section Image + Texte (Alterné)',
  type: 'object',
  fields: [
    {
      name: 'subtitle',
      type: 'string',
      title: 'Sous-titre (ex: Ma philosophie)',
    },
    {
      name: 'title',
      type: 'string',
      title: 'Titre principal',
    },
    ...headingTypographyFields({ subtitle: true }),
    {
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }],
      title: 'Contenu',
    },

    // IMAGE PRINCIPALE
    {
      name: 'image',
      type: 'image',
      title: 'Image principale',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt' },
        imagePresentationField(),
      ],
    },

    // IMAGES FLOTTANTES MULTIPLES
    {
      name: 'floatingImages',
      type: 'array',
      title: 'Images superposées / flottantes',
      description:
        'Ajoutez autant d’images que nécessaire. Chaque image possède sa propre taille et sa propre position sur l’image principale.',
      of: [
        {
          type: 'object',
          name: 'floatingImage',
          title: 'Image flottante',
          fields: [
            {
              name: 'image',
              type: 'image',
              title: 'Image',
              options: { hotspot: true },
              validation: (Rule: any) => Rule.required(),
              fields: [
                { name: 'alt', type: 'string', title: 'Texte alternatif' },
                imagePresentationField({ fit: 'contain' }),
              ],
            },
            {
              name: 'size',
              type: 'string',
              title: 'Taille',
              options: {
                list: [
                  { title: 'Petite (ex: logo)', value: 'sm' },
                  { title: 'Moyenne (ex: téléphone)', value: 'md' },
                  { title: 'Grande', value: 'lg' },
                ],
                layout: 'radio',
              },
              initialValue: 'md',
            },
            {
              name: 'position',
              type: 'string',
              title: 'Emplacement sur l’image',
              options: {
                list: [
                  { title: 'En bas à droite', value: 'bottom-right' },
                  { title: 'En bas à gauche', value: 'bottom-left' },
                  { title: 'Au milieu à droite', value: 'center-right' },
                  { title: 'Au milieu à gauche', value: 'center-left' },
                  { title: 'En haut à droite', value: 'top-right' },
                  { title: 'En haut à gauche', value: 'top-left' },
                ],
                layout: 'radio',
              },
              initialValue: 'center-right',
            },
          ],
          preview: {
            select: {
              media: 'image',
              size: 'size',
              position: 'position',
            },
            prepare({ media, size, position }: any) {
              const positions: Record<string, string> = {
                'bottom-right': 'Bas droite',
                'bottom-left': 'Bas gauche',
                'center-right': 'Milieu droite',
                'center-left': 'Milieu gauche',
                'top-right': 'Haut droite',
                'top-left': 'Haut gauche',
              }

              return {
                title: `Image ${size || 'md'} - ${positions[position] || position || 'Milieu droite'}`,
                media,
              }
            },
          },
        },
      ],
    },

    // POSITION DE L'IMAGE PRINCIPALE
    {
      name: 'imagePosition',
      type: 'string',
      title: 'Position de l’image principale',
      options: {
        list: [
          { title: 'Gauche', value: 'left' },
          { title: 'Droite', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    },
    {
      name: 'imageSize',
      type: 'string',
      title: "Taille de l'image principale",
      options: {
        list: [
          { title: 'Petite', value: 'sm' },
          { title: 'Moyenne', value: 'md' },
          { title: 'Grande', value: 'lg' },
        ],
        layout: 'radio',
      },
      initialValue: 'md',
    },

    // COULEUR DE FOND
    {
      name: 'backgroundColor',
      type: 'string',
      title: 'Couleur de fond',
      options: {
        list: [
          { title: 'Blanc', value: 'white' },
          { title: 'Beige', value: 'cream' },
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
}
