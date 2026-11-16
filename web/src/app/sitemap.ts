import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://roadtrip.anabo.mg'
  const locales = ['fr', 'en', 'it']
  const lastModified = new Date()

  // Liste des pages principales de votre site
  const routes = [
    '',            // Accueil
    '/tour-ideas', // Idées de circuits
    '/gallery',    // Galerie
    '/trip-guidelines', // Conseils de voyage
    '/about',      // À propos
    '/contact'     // Contact
  ]

  // Générer les URLs pour chaque langue
  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : 0.8,
    }))
  )
}