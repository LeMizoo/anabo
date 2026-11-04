import { headingTypographyFields } from '../headingTypographyFields'
import { imagePresentationField } from '../imagePresentationField'

export default {
  name: 'puzzleGalleryBlock',
  title: 'Galerie Puzzle (Asymétrique)',
  type: 'object',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Titre de la section (optionnel)',
    },
    ...headingTypographyFields(),
    {
      name: 'layout',
      type: 'string',
      title: 'Organisation des images',
      description:
        'La composition automatique répartit les images en mosaïque. Choisissez « Manuelle » pour utiliser la taille définie sur chaque image.',
      options: {
        list: [
          { title: 'Mosaïque automatique', value: 'balanced' },
          { title: 'Tailles manuelles', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'balanced',
    },
    {
      name: 'items',
      type: 'array',
      title: 'Images du puzzle',
      of: [
        {
          name: 'puzzleItem', // Le nom est bien ici
          type: 'object',
          fields: [
            { 
              name: 'image', 
              type: 'image', 
              title: 'Image', 
              options: { hotspot: true }, 
              fields: [
                { name: 'alt', type: 'string', title: 'Texte alternatif' },
                imagePresentationField(),
              ]
            },
            { 
              name: 'size', 
              type: 'string', 
              title: 'Taille (organisation manuelle)',
              description: 'Utilisée lorsque l’organisation de la galerie est réglée sur « Tailles manuelles ».',
              options: {
                list: [
                  { title: 'Petit (1x1)', value: 'small' },
                  { title: 'Large (2x1)', value: 'wide' },
                  { title: 'Haut (1x2)', value: 'tall' },
                  { title: 'Grand (2x2)', value: 'large' },
                ]
              },
              initialValue: 'small'
            },
            {
              name: 'overlap',
              type: 'string',
              title: 'Superposition',
              description: 'Décale cette image au-dessus des voisines dans la mosaïque.',
              options: {
                list: [
                  { title: 'Aucune', value: 'none' },
                  { title: 'Vers le haut-gauche', value: 'top-left' },
                  { title: 'Vers le haut-droite', value: 'top-right' },
                  { title: 'Vers le bas-gauche', value: 'bottom-left' },
                  { title: 'Vers le bas-droite', value: 'bottom-right' },
                ],
                layout: 'radio',
              },
              initialValue: 'none',
            },
            {
              name: 'pixelation',
              type: 'string',
              title: 'Pixelisation',
              description: 'Réduit la résolution de l’image avant de l’agrandir pour créer un effet pixelisé.',
              options: {
                list: [
                  { title: 'Aucune', value: 'none' },
                  { title: 'Légère', value: 'low' },
                  { title: 'Moyenne', value: 'medium' },
                  { title: 'Forte', value: 'high' },
                ],
                layout: 'radio',
              },
              initialValue: 'none',
            },
            {
              name: 'overlay',
              type: 'string',
              title: 'Voile de couleur',
              options: {
                list: [
                  { title: 'Aucun', value: 'none' },
                  { title: 'Sombre', value: 'dark' },
                  { title: 'Clair', value: 'light' },
                  { title: 'Doré', value: 'accent' },
                ],
                layout: 'radio',
              },
              initialValue: 'none',
            },
            { 
              name: 'caption', 
              type: 'string', 
              title: 'Légende (optionnel)' 
            }
          ],
          preview: {
            select: { title: 'caption', media: 'image', subtitle: 'size' }
          }
        }
      ]
    },
    {
      name: 'settings',
      type: 'blockSettings',
      title: 'Réglages de la section',
    },
  ]
}