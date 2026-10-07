export default {
  name: 'siteSettings',
  title: 'Paramètres du site',
  type: 'document',
  groups: [
    { name: 'general', title: 'Général', default: true },
    { name: 'contact', title: 'Contact' },
    { name: 'social', title: 'Réseaux sociaux' },
  ],
  fields: [
    {
      name: 'siteName',
      type: 'string',
      title: 'Nom du site',
      initialValue: 'ANABO ROADTRIP MADAGASCAR',
      group: 'general',
    },
    { name: 'tagline', type: 'string', title: 'Slogan', group: 'general' },
    {
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 3,
      group: 'general',
    },
    { name: 'logo', type: 'image', title: 'Logo', group: 'general' },
    {
      name: 'favicon',
      type: 'image',
      title: 'Favicon',
      group: 'general',
    },
    {
      name: 'contactEmail',
      type: 'string',
      title: 'Email',
      initialValue: 'contact@anabo.mg',
      group: 'contact',
    },
    {
      name: 'contactPhone',
      type: 'string',
      title: 'Téléphone',
      initialValue: '+261 34 14 914 54',
      group: 'contact',
    },
    {
      name: 'whatsappNumber',
      type: 'string',
      title: 'Numéro WhatsApp',
      initialValue: '+261341491454',
      group: 'contact',
    },
    {
      name: 'address',
      type: 'text',
      title: 'Adresse',
      rows: 2,
      group: 'contact',
    },
    {
      name: 'socialLinks',
      type: 'array',
      title: 'Réseaux sociaux',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              type: 'string',
              options: {
                list: [
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'TikTok', value: 'tiktok' },
                ],
              },
            },
            { name: 'url', type: 'url', title: 'URL' },
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        },
      ],
      group: 'social',
    },
  ],
  preview: {
    prepare() {
      return { title: 'Paramètres du site' }
    },
  },
}
