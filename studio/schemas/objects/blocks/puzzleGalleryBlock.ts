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
              fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }] 
            },
            { 
              name: 'size', 
              type: 'string', 
              title: 'Taille dans la grille', 
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
    }
  ]
}