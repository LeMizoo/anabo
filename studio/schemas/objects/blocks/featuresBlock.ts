export default {
  name: 'featuresBlock',
  title: 'Grille de fonctionnalités',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre de la section' },
    {
      name: 'titleFont',
      type: 'string',
      title: 'Police du titre',
      options: {
        list: [
          { title: 'Playfair (Serif)', value: 'font-serif' },
          { title: 'Perfect Girl Sans Serif', value: 'font-perfect-sans' },
          { title: 'Perfect Girl Script', value: 'font-script' },
        ],
        layout: 'radio',
      },
      initialValue: 'font-serif',
    },
    {
      name: 'titleWeight',
      type: 'string',
      title: 'Graisse du titre',
      options: {
        list: [
          { title: 'Normal', value: 'font-normal' },
          { title: 'Gras (Bold)', value: 'font-bold' },
        ],
        layout: 'radio',
      },
      initialValue: 'font-bold',
    },
    { name: 'content', type: 'text', title: 'Texte d\'introduction', rows: 3 },
    {
      name: 'features',
      type: 'array',
      title: 'Fonctionnalités',
      of: [{
        name: 'featureItem',
        type: 'object',
        fields: [
          { name: 'title', type: 'string', title: 'Titre de la fonctionnalité' },
          { name: 'description', type: 'text', title: 'Description', rows: 3 },
          { name: 'icon', type: 'string', title: 'Icône (ex: check, shield, map)', initialValue: 'check' }
        ],
        preview: {
          select: { title: 'title', subtitle: 'description' }
        }
      }]
    }
  ]
}