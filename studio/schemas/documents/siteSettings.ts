export default {
  name: 'siteSettings',
  title: 'Paramètres du site',
  type: 'document',
  groups: [
    { name: 'general', title: 'Général', default: true },
    { name: 'typography', title: 'Typographie' }, // 👈 Nouveau groupe
    { name: 'headerFooter', title: 'En-tête et pied de page' },
    { name: 'contact', title: 'Contact' },
    { name: 'social', title: 'Réseaux sociaux' },
  ],
  fields: [
    {
      name: 'siteName',
      type: 'string',
      title: 'Nom du site',
      initialValue: 'Madagascar Car Rental with Driver-Guide - Malagasy Company',
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
            { name: 'siteName', type: 'string', title: 'Site name', initialValue: 'Madagascar Car Rental with Driver-Guide - Malagasy Company' },
            { name: 'tagline', type: 'string', title: 'Tagline' },
            { name: 'description', type: 'text', title: 'Description', rows: 5 },
          ],
        },
        {
          name: 'fr',
          type: 'object',
          title: 'Francais',
          fields: [
            { name: 'siteName', type: 'string', title: 'Nom du site', initialValue: 'Madagascar Car Rental with Driver-Guide - Malagasy Company' },
            { name: 'tagline', type: 'string', title: 'Slogan' },
            { name: 'description', type: 'text', title: 'Description', rows: 5 },
          ],
        },
        {
          name: 'it',
          type: 'object',
          title: 'Italiano',
          fields: [
            { name: 'siteName', type: 'string', title: 'Nome del sito', initialValue: 'Madagascar Car Rental with Driver-Guide - Malagasy Company' },
            { name: 'tagline', type: 'string', title: 'Slogan' },
            { name: 'description', type: 'text', title: 'Descrizione', rows: 5 },
          ],
        },
      ],
    },
    {
      name: 'logo',
      type: 'image',
      title: 'Logo',
      description: 'Utilisé dans l’en-tête et le pied de page.',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }],
      group: 'general',
    },
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
              { title: 'Caflisch Script', value: 'font-caflisch' },
              { title: 'Euphoria Script', value: 'font-euphoria' },
              { title: 'DM Sans', value: 'font-dm-sans' },
              { title: 'Playfair (Serif)', value: 'font-serif' },
              { title: 'Perfect Girl Sans', value: 'font-perfect-sans' },
              { title: 'Perfect Girl Script', value: 'font-script' },
              { title: 'Poppins', value: 'font-poppins' },
            ],
          },
          initialValue: 'font-caflisch',
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
          initialValue: 'font-normal',
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
      name: 'header',
      title: 'En-tête',
      type: 'object',
      group: 'headerFooter',
      options: { collapsible: true, collapsed: false },
      fields: [
        { name: 'showLogo', type: 'boolean', title: 'Afficher le logo', initialValue: true },
        {
          name: 'logoHeight',
          type: 'number',
          title: 'Hauteur du logo (px)',
          description: 'La largeur s’ajuste automatiquement aux proportions du logo.',
          initialValue: 48,
          validation: (Rule: any) => Rule.min(24).max(100),
        },
        {
          name: 'logoOpacity',
          type: 'number',
          title: 'Opacité du logo (%)',
          description: '0 = invisible, 100 = opaque.',
          initialValue: 100,
          validation: (Rule: any) => Rule.min(0).max(100),
        },
        { name: 'sticky', type: 'boolean', title: 'Garder l’en-tête visible au défilement', initialValue: true },
        { name: 'showNavigation', type: 'boolean', title: 'Afficher la navigation', initialValue: true },
        { name: 'showThemeToggle', type: 'boolean', title: 'Afficher le bouton de thème', initialValue: true },
        { name: 'showLanguageSwitcher', type: 'boolean', title: 'Afficher le choix des langues', initialValue: true },
      ],
    },
    {
      name: 'footer',
      title: 'Pied de page',
      type: 'object',
      group: 'headerFooter',
      options: { collapsible: true, collapsed: false },
      fields: [
        { name: 'showTagline', type: 'boolean', title: 'Afficher le slogan', initialValue: true },
        { name: 'showDescription', type: 'boolean', title: 'Afficher la description', initialValue: true },
        { name: 'showNavigation', type: 'boolean', title: 'Afficher les liens de navigation', initialValue: true },
        { name: 'showContact', type: 'boolean', title: 'Afficher les coordonnées', initialValue: true },
        { name: 'showSocialLinks', type: 'boolean', title: 'Afficher les réseaux sociaux', initialValue: true },
      ],
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
      name: 'showFloatingWhatsapp',
      type: 'boolean',
      title: 'Afficher le bouton WhatsApp flottant',
      initialValue: true,
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