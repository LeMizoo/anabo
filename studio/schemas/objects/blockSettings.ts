import { defineField } from 'sanity'

export default {
  name: 'blockSettings',
  title: 'Réglages du bloc',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'anchorId',
      type: 'string',
      title: 'Ancre (lien interne)',
      description: 'Ex. « avis » permet un lien vers /fr#avis. Lettres minuscules et tirets.',
      validation: (Rule) =>
        Rule.regex(/^[a-z0-9-]*$/, { name: 'ancre' }).error('Minuscules, chiffres et tirets seulement'),
    }),
    {
      name: 'background',
      type: 'string',
      title: 'Fond',
      options: {
        list: [
          { title: 'Blanc', value: 'white' },
          { title: 'Beige', value: 'cream' },
          { title: 'Bleu foncé', value: 'navy' },
        ],
        layout: 'radio',
      },
      initialValue: 'white',
    },
    {
      name: 'spacing',
      type: 'string',
      title: 'Espacement vertical',
      options: {
        list: [
          { title: 'Compact', value: 'sm' },
          { title: 'Normal', value: 'md' },
          { title: 'Large', value: 'lg' },
        ],
        layout: 'radio',
      },
      initialValue: 'md',
    },
    {
      name: 'contentWidth',
      type: 'string',
      title: 'Largeur horizontale du contenu',
      options: {
        list: [
          { title: 'Standard', value: 'standard' },
          { title: 'Large', value: 'wide' },
          { title: 'Pleine largeur', value: 'full' },
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
    },
    { name: 'hidden', type: 'boolean', title: 'Masquer ce bloc (sans le supprimer)', initialValue: false },
  ],
}