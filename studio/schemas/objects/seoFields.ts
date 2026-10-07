export default {
  name: 'seoFields',
  title: 'Champs SEO',
  type: 'object',
  options: { collapsible: true, collapsed: false },
  fields: [
    {
      name: 'metaTitle',
      type: 'string',
      title: 'Meta Title',
      description: 'Titre affiché dans Google (max 60 caractères)',
      validation: (Rule: any) => Rule.max(60),
    },
    {
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      description: 'Description dans Google (max 160 caractères)',
      rows: 3,
      validation: (Rule: any) => Rule.max(160),
    },
    {
      name: 'keywords',
      type: 'array',
      title: 'Mots-clés',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    },
    {
      name: 'ogImage',
      type: 'image',
      title: 'Image Open Graph',
      description: 'Image pour les partages sociaux (1200x630px)',
    },
    {
      name: 'canonicalUrl',
      type: 'url',
      title: 'URL Canonique',
    },
    {
      name: 'noIndex',
      type: 'boolean',
      title: 'No Index',
      initialValue: false,
    },
  ],
}
