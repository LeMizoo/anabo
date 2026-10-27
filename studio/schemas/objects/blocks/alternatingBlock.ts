export default {
  name: 'alternatingBlock',
  title: 'Texte et Image (Alterné)',
  type: 'object',
  fields: [
    { 
      name: 'subtitle', 
      type: 'string', 
      title: 'Sous-titre (ex: Ma philosophie)',
    },
    {
      name: 'subtitleFont',
      type: 'string',
      title: 'Police du sous-titre',
      options: {
        list: [
          { title: 'Perfect Girl Script (Manuscrite)', value: 'font-script' },
          { title: 'Perfect Girl Sans Serif (Moderne)', value: 'font-perfect-sans' },
          { title: 'Playfair (Serif)', value: 'font-serif' },
        ],
        layout: 'radio',
      },
      initialValue: 'font-script',
    },
    { 
      name: 'title', 
      type: 'string', 
      title: 'Titre principal' 
    },
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
    { name: 'content', type: 'array', of: [{ type: 'block' }], title: 'Contenu' },
    { name: 'image', type: 'image', title: 'Image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Alt' }] },
    { 
      name: 'imagePosition', 
      type: 'string', 
      title: 'Position de l\'image', 
      options: { list: [{ title: 'Gauche', value: 'left' }, { title: 'Droite', value: 'right' }], layout: 'radio' },
      initialValue: 'right'
    },
    { 
      name: 'backgroundColor', 
      type: 'string', 
      title: 'Couleur de fond', 
      options: { list: [{ title: 'Blanc', value: 'white' }, { title: 'Beige', value: 'cream' }], layout: 'radio' },
      initialValue: 'white'
    }
  ]
}