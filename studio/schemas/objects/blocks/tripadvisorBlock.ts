export default {
  name: 'tripadvisorBlock',
  title: 'Avis TripAdvisor',
  type: 'object',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Titre',
      initialValue: 'Ils nous ont fait confiance',
    },
    {
      name: 'showBadge',
      type: 'boolean',
      title: 'Afficher le badge',
      initialValue: true,
    },
    {
      name: 'showCarousel',
      type: 'boolean',
      title: 'Afficher le carousel',
      initialValue: true,
    },
    {
      name: 'reviewLimit',
      type: 'number',
      title: 'Nombre d\'avis affichés',
      initialValue: 6,
    },
  ],
  preview: {
    prepare() {
      return { title: 'Avis TripAdvisor', subtitle: 'Bloc TripAdvisor' }
    },
  },
}
