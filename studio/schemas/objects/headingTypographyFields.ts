const fontOptions = [
  { title: 'Inter (Sans-serif)', value: 'font-sans' },
  { title: 'Poppins', value: 'font-poppins' },
  { title: 'Playfair (Serif)', value: 'font-serif' },
  { title: 'Playfair Display SC', value: 'font-playfair-sc' },
  { title: 'Perfect Girl Sans Serif', value: 'font-perfect-sans' },
  { title: 'Perfect Girl Script', value: 'font-script' },
  { title: 'Euphoria Script', value: 'font-euphoria' },
  { title: 'Haigrast Script', value: 'font-haigrast' },
  { title: 'Script Alt', value: 'font-script-alt' },
  { title: 'Script In', value: 'font-script-in' },
]

const colorOptions = [
  { title: 'Bleu marine', value: 'navy' },
  { title: 'Doré', value: 'gold' },
  { title: 'Gris texte', value: 'charcoal' },
  { title: 'Blanc', value: 'white' },
]

const sizeOptions = [
  { title: 'Petit', value: 'sm' },
  { title: 'Moyen', value: 'md' },
  { title: 'Grand', value: 'lg' },
  { title: 'Très grand', value: 'xl' },
  { title: 'Extra large', value: '2xl' },
]

type Options = {
  titleFont?: string
  subtitleFont?: string
  subtitle?: boolean
}

export function headingTypographyFields({
  titleFont = 'font-script',
  subtitleFont = 'font-sans',
  subtitle = false,
}: Options = {}) {
  return [
    {
      name: 'titleFont',
      type: 'string',
      title: 'Police du titre',
      options: { list: fontOptions, layout: 'radio' },
      initialValue: titleFont,
    },
    {
      name: 'titleColor',
      type: 'string',
      title: 'Couleur du titre',
      options: { list: colorOptions, layout: 'radio' },
      initialValue: 'gold',
    },
    {
      name: 'titleSize',
      type: 'string',
      title: 'Taille du titre',
      options: { list: sizeOptions, layout: 'radio' },
      initialValue: '2xl',
    },
    ...(subtitle
      ? [
          {
            name: 'subtitleFont',
            type: 'string',
            title: 'Police du sous-titre',
            options: { list: fontOptions, layout: 'radio' },
            initialValue: subtitleFont,
          },
          {
            name: 'subtitleColor',
            type: 'string',
            title: 'Couleur du sous-titre',
            options: { list: colorOptions, layout: 'radio' },
            initialValue: 'navy',
          },
          {
            name: 'subtitleSize',
            type: 'string',
            title: 'Taille du sous-titre',
            options: { list: sizeOptions, layout: 'radio' },
            initialValue: 'md',
          },
        ]
      : []),
  ]
}
