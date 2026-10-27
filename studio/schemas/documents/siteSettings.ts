export default {
  name: 'siteSettings',
  title: 'Paramètres du site',
  type: 'document',
  groups: [
    { name: 'general', title: 'Général', default: true },
    { name: 'typography', title: 'Typographie' }, // 👈 Nouveau groupe
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
    {
      name: 'localized',
      type: 'object',
      title: 'Contenu multilingue',
      group: 'general',
      fields: [
        {
          name: 'en',
          type: 'object',
          title: 'English',
          fields: [
            { name: 'siteName', type: 'string', title: 'Site name' },
            { name: 'tagline', type: 'string', title: 'Tagline' },
            { name: 'description', type: 'text', title: 'Description', rows: 5 },
          ],
        },
        {
          name: 'fr',
          type: 'object',
          title: 'Francais',
          fields: [
            { name: 'siteName', type: 'string', title: 'Nom du site' },
            { name: 'tagline', type: 'string', title: 'Slogan' },
            { name: 'description', type: 'text', title: 'Description', rows: 5 },
          ],
        },
        {
          name: 'it',
          type: 'object',
          title: 'Italiano',
          fields: [
            { name: 'siteName', type: 'string', title: 'Nome del sito' },
            { name: 'tagline', type: 'string', title: 'Slogan' },
            { name: 'description', type: 'text', title: 'Descrizione', rows: 5 },
          ],
        },
      ],
    },
    { name: 'logo', type: 'image', title: 'Logo', group: 'general' },
    {
      name: 'favicon',
      type: 'image',
      title: 'Favicon',
      group: 'general',
    },
    // 👇 NOUVEAUX CHAMPS POUR LA TYPOGRAPHIE GLOBALE 👇
    {
      name: 'typography',
      title: 'Typographie globale',
      type: 'object',
      group: 'typography',
      fields: [
        {
          name: 'globalHeadingFont',
          title: 'Police par défaut des titres',
          type: 'string',
          options: {
            list: [
              { title: 'Playfair (Serif)', value: 'font-serif' },
              { title: 'Perfect Girl Sans', value: 'font-perfect-sans' },
              { title: 'Perfect Girl Script', value: 'font-script' },
              { title: 'Poppins', value: 'font-poppins' },
            ],
          },
          initialValue: 'font-serif',
        },
        {
          name: 'globalHeadingWeight',
          title: 'Graisse par défaut des titres',
          type: 'string',
          options: {
            list: [
              { title: 'Normal', value: 'font-normal' },
              { title: 'Gras (Bold)', value: 'font-bold' },
            ],
          },
          initialValue: 'font-bold',
        },
        {
          name: 'globalBodyFont',
          title: 'Police par défaut du texte',
          type: 'string',
          options: {
            list: [
              { title: 'Inter', value: 'font-sans' },
              { title: 'Perfect Girl Sans', value: 'font-perfect-sans' },
              { title: 'Poppins', value: 'font-poppins' },
            ],
          },
          initialValue: 'font-sans',
        },
      ],
    },
    // 👇 FIN DES NOUVEAUX CHAMPS 👇
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