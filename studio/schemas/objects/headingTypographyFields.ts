const fontOptions = [
  { title: 'Inter (Sans-serif)', value: 'font-sans' },
  { title: 'DM Sans', value: 'font-dm-sans' },
  { title: 'Poppins', value: 'font-poppins' },
  { title: 'Playfair (Serif)', value: 'font-serif' },
  { title: 'Playfair Display SC', value: 'font-playfair-sc' },
  { title: 'Perfect Girl Sans Serif', value: 'font-perfect-sans' },
  { title: 'Perfect Girl Script', value: 'font-script' },
  { title: 'Caflisch Script', value: 'font-caflisch' },
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

const headingLevelOptions = [
  { title: 'H1 — Grand', value: 'h1' },
  { title: 'H2 — Moyen', value: 'h2' },
  { title: 'H3 — Plus petit', value: 'h3' },
]

const weightOptions = [
  { title: 'Normal', value: 'font-normal' },
  { title: 'Gras', value: 'font-bold' },
]

type Options = {
  titleFont?: string
  subtitleFont?: string
  subtitle?: boolean
  textColors?: string[]
}

export function headingTypographyFields({
  titleFont = 'font-caflisch',
  subtitleFont = 'font-sans',
  subtitle = false,
  textColors,
}: Options = {}) {
  const availableColorOptions = textColors
    ? colorOptions.filter((option) => textColors.includes(option.value))
    : colorOptions
  const initialTitleColor = availableColorOptions.some((option) => option.value === 'gold')
    ? 'gold'
    : availableColorOptions[0]?.value
  const initialSubtitleColor = availableColorOptions.some((option) => option.value === 'white')
    ? 'white'
    : availableColorOptions[0]?.value

  return [
    {
      name: 'titleFont',
      type: 'string',
      title: 'Police du titre',
      options: { list: fontOptions, layout: 'radio' },
      initialValue: titleFont,
    },
    {
      name: 'titleWeight',
      type: 'string',
      title: 'Graisse du titre',
      options: { list: weightOptions, layout: 'radio' },
      initialValue: 'font-normal',
    },
    {
      name: 'titleColor',
      type: 'string',
      title: 'Couleur du titre',
      options: { list: availableColorOptions, layout: 'radio' },
      initialValue: initialTitleColor,
    },
    {
      name: 'titleSize',
      type: 'string',
      title: 'Niveau visuel du titre',
      description: 'Choisissez une taille de titre adaptée à l’écran. Le niveau HTML est défini par le bloc.',
      options: { list: headingLevelOptions, layout: 'radio' },
      initialValue: 'h2',
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
            options: { list: availableColorOptions, layout: 'radio' },
            initialValue: initialSubtitleColor,
          },
          {
            name: 'subtitleSize',
            type: 'string',
            title: 'Niveau visuel du sous-titre',
            description: 'Choisissez une taille de sous-titre adaptée à l’écran. Le niveau HTML est défini par le bloc.',
            options: { list: headingLevelOptions, layout: 'radio' },
            initialValue: 'h3',
          },
        ]
      : []),
  ]
}
