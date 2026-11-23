import 'flag-icons/css/flag-icons.min.css'
import type { Metadata } from 'next'
import './globals.css'
import { SITE_NAME, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Circuits privés, road trips et voyages sur mesure à Madagascar avec nos chauffeurs-guides, reconnus par des voyageurs du monde entier.',
  metadataBase: new URL(SITE_URL),
}

/**
 * Layout racine « transparent » (schéma recommandé par next-intl) :
 * les balises <html>/<body> sont rendues par app/[locale]/layout.tsx
 * (avec la bonne langue en/fr/it) et par app/admin/layout.tsx.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
