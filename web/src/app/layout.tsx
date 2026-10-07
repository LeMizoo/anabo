import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ANABO ROADTRIP MADAGASCAR',
    template: '%s | ANABO ROADTRIP',
  },
  description:
    'Circuits privés, roadtrips et voyages sur mesure à Madagascar avec chauffeur-guide.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://anabo.mg'
  ),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
