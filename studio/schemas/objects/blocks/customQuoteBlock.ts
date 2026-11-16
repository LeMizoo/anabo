import { headingTypographyFields } from '../headingTypographyFields'

const optionFields = [
  { name: 'value', type: 'string', title: 'Valeur technique', validation: (Rule: any) => Rule.required() },
  { name: 'title', type: 'string', title: 'Titre', validation: (Rule: any) => Rule.required() },
  { name: 'description', type: 'string', title: 'Courte description' },
  {
    name: 'image',
    type: 'image',
    title: 'Image (optionnelle)',
    options: { hotspot: true },
    fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }],
  },
]

const optionsArray = (name: string, title: string) => ({
  name,
  type: 'array',
  title,
  of: [{ name: `${name}Option`, type: 'object', fields: optionFields }],
})

export default {
  name: 'customQuoteBlock',
  title: 'Devis de voyage sur mesure',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre', validation: (Rule: any) => Rule.required() },
    ...headingTypographyFields(),
    { name: 'description', type: 'text', title: 'Introduction', rows: 3 },
    { name: 'regionHeading', type: 'string', title: 'Titre du choix des régions' },
    optionsArray('regions', 'Régions proposées'),
    { name: 'experienceHeading', type: 'string', title: 'Titre des expériences' },
    optionsArray('experiences', 'Expériences proposées'),
    { name: 'vehicleHeading', type: 'string', title: 'Titre du choix du véhicule' },
    optionsArray('vehicles', 'Véhicules proposés'),
    { name: 'submitLabel', type: 'string', title: 'Texte du bouton' },
    {
      name: 'settings',
      type: 'blockSettings',
      title: 'Réglages de la section',
    },
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }: { title?: string }) {
      return { title: title || 'Devis de voyage sur mesure', subtitle: 'Formulaire en grilles' }
    },
  },
}
