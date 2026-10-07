export default {
  name: 'textMediaBlock',
  title: 'Texte + Média',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre de la section' },
    {
      name: 'content',
      type: 'array',
      title: 'Contenu',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Citation', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Gras', value: 'strong' },
              { title: 'Italique', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Lien',
                fields: [
                  { name: 'href', type: 'url', title: 'URL' },
                  { name: 'blank', type: 'boolean', title: 'Nouvel onglet' },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      name: 'image',
      type: 'image',
      title: 'Image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }],
    },
    {
      name: 'imagePosition',
      type: 'string',
      title: 'Position de l\'image',
      options: {
        list: [
          { title: 'Gauche', value: 'left' },
          { title: 'Droite', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    },
    {
      name: 'cta',
      type: 'object',
      title: 'Bouton (optionnel)',
      fields: [
        { name: 'label', type: 'string', title: 'Texte' },
        { name: 'link', type: 'string', title: 'Lien' },
      ],
    },
  ],
  preview: {
    select: { title: 'title', media: 'image' },
    prepare({ title, media }: any) {
      return { title: title || 'Texte + Média', subtitle: 'Contenu', media }
    },
  },
}
