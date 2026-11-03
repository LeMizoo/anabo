const positions = [
  { title: 'Centre', value: 'center' },
  { title: 'Haut', value: 'top' },
  { title: 'Droite', value: 'right' },
  { title: 'Bas', value: 'bottom' },
  { title: 'Gauche', value: 'left' },
]

type Defaults = {
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  fit?: 'cover' | 'contain'
}

export function imagePresentationField(defaults: Defaults = {}) {
  return {
    name: 'presentation',
    type: 'object',
    title: 'Présentation de l’image',
    options: { collapsible: true, collapsed: true },
    fields: [
      {
        name: 'rotation',
        type: 'string',
        title: 'Rotation',
        options: {
          list: [
            { title: 'Aucune', value: '0' },
            { title: '5° vers la gauche', value: '-5' },
            { title: '10° vers la gauche', value: '-10' },
            { title: '5° vers la droite', value: '5' },
            { title: '10° vers la droite', value: '10' },
          ],
          layout: 'radio',
        },
        initialValue: '0',
      },
      {
        name: 'border',
        type: 'string',
        title: 'Bordure',
        options: {
          list: [
            { title: 'Aucune', value: 'none' },
            { title: 'Fine claire', value: 'light' },
            { title: 'Fine foncée', value: 'dark' },
            { title: 'Dorée', value: 'accent' },
          ],
          layout: 'radio',
        },
        initialValue: 'none',
      },
      {
        name: 'radius',
        type: 'string',
        title: 'Coins',
        options: {
          list: [
            { title: 'Carrés', value: 'none' },
            { title: 'Petits', value: 'sm' },
            { title: 'Moyens', value: 'md' },
            { title: 'Arrondis', value: 'lg' },
            { title: 'Ronds', value: 'full' },
          ],
          layout: 'radio',
        },
        initialValue: defaults.radius || 'md',
      },
      {
        name: 'shadow',
        type: 'string',
        title: 'Ombre',
        options: {
          list: [
            { title: 'Aucune', value: 'none' },
            { title: 'Légère', value: 'sm' },
            { title: 'Moyenne', value: 'md' },
            { title: 'Forte', value: 'lg' },
          ],
          layout: 'radio',
        },
        initialValue: defaults.shadow || 'sm',
      },
      {
        name: 'fit',
        type: 'string',
        title: 'Cadrage',
        description:
          '« Afficher toute l’image » conserve ses proportions et laisse transparent l’espace restant dans le cadre.',
        options: {
          list: [
            { title: 'Remplir le cadre', value: 'cover' },
            { title: 'Afficher toute l’image', value: 'contain' },
          ],
          layout: 'radio',
        },
        initialValue: defaults.fit || 'cover',
      },
      {
        name: 'position',
        type: 'string',
        title: 'Point de cadrage',
        options: { list: positions, layout: 'radio' },
        initialValue: 'center',
      },
    ],
  }
}
