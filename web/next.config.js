const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/': ['./messages/**/*'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'dynamic-media-cdn.tripadvisor.com',
        pathname: '/media/**',
        // 👇 On ne met PAS de "search" ici, ce qui autorise ?w=...&h=...&s=1
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
    cpus: 1,
    workerThreads: false,
    webpackMemoryOptimizations: true,
    webpackBuildWorker: false,
    staticGenerationMaxConcurrency: 1,
  },

  // Métadonnées (<title>, description, hreflang…) toujours rendues dans le <head>, jamais
  // diffusées en streaming en fin de page : supprime les erreurs d'hydratation intermittentes
  // (React #418) observées quand generateMetadata répondait après l'envoi de la page,
  // et garantit des balises SEO présentes dès le premier octet pour tous les visiteurs.
  htmlLimitedBots: /.*/,

  productionBrowserSourceMaps: false,
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  // La galerie est fusionnée dans la page Madagascar (section « photos »).
  async redirects() {
    return [
      { source: '/:locale(fr|en|it)/gallery', destination: '/:locale/madagascar#photos', permanent: true },
      { source: '/gallery', destination: '/fr/madagascar#photos', permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Les navigateurs utilisent toujours HTTPS pour ce site (1 an).
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = withNextIntl(nextConfig)
