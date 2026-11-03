const fontOptions = [
  { title: 'Inter (Sans-serif)', value: 'font-sans' },
  { title: 'Poppins', value: 'font-poppins' },
  { title: 'Playfair (Serif)', value: 'font-serif' },
  { title: 'Perfect Girl Sans Serif', value: 'font-perfect-sans' },
  { title: 'Perfect Girl Script', value: 'font-script' },
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
  titleFont = 'font-serif',
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
      name: 'titleSize',
      type: 'string',
      title: 'Taille du titre',
      options: { list: sizeOptions, layout: 'radio' },
      initialValue: 'md',
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
