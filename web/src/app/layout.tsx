import 'flag-icons/css/flag-icons.min.css'
import type { Metadata } from 'next'
import './globals.css'
// 👇 Ajout des imports
import { inter, poppins, playfair, perfectGirlScript, perfectGirlSans } from '@/lib/fonts'

export const metadata: Metadata = {
  title: {
    default: 'ANABO ROADTRIP MADAGASCAR',
    template: '%s | ANABO ROADTRIP',
  },
  description:
    'Circuits privés, roadtrips et voyages sur mesure à Madagascar avec chauffeur-guide.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://anabo.mg',
  ),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 👇 Ajout des variables
    <html 
      lang="fr" 
      className={`
        ${inter.variable} 
        ${poppins.variable} 
        ${playfair.variable} 
        ${perfectGirlScript.variable} 
        ${perfectGirlSans.variable}
      `}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}