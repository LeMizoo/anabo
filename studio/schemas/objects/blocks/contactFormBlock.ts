export default {
  name: 'contactFormBlock',
  title: 'Formulaire de contact',
  type: 'object',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Titre',
      initialValue: 'Contactez-nous',
    },
    { name: 'description', type: 'text', title: 'Description', rows: 2 },
    {
      name: 'formType',
      type: 'string',
      title: 'Type de formulaire',
      options: {
        list: [
          { title: 'Contact', value: 'contact' },
          { title: 'Devis', value: 'quote' },
        ],
        layout: 'radio',
      },
      initialValue: 'contact',
    },
    {
      name: 'showWhatsapp',
      type: 'boolean',
      title: 'Afficher WhatsApp',
      initialValue: true,
    },
  ],
  preview: {
    prepare() {
      return { title: 'Formulaire de contact', subtitle: 'Bloc formulaire' }
    },
  },
}
