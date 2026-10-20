const createNextIntlPlugin = require('next-intl/plugin')
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin')

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/': [
      './messages/**/*',
      '../node_modules/next-intl/**/*',
      '../node_modules/use-intl/**/*',
      '../node_modules/@formatjs/**/*',
      '../node_modules/negotiator/**/*',
      '../node_modules/.prisma/client/**/*',
      '../node_modules/@prisma/client/**/*',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

module.exports = withNextIntl(nextConfig)
