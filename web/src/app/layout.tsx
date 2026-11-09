import 'flag-icons/css/flag-icons.min.css'
import type { Metadata } from 'next'
import './globals.css'
// 👇 Ajout des imports
import {
  dmSans,
  euphoriaScript,
  haigrastScript,
  inter,
  playfair,
  playfairDisplaySc,
  perfectGirlSans,
  perfectGirlScript,
  poppins,
  scriptAlt,
  scriptIn,
} from '@/lib/fonts'
import { SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
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
        ${dmSans.variable}
        ${poppins.variable} 
        ${playfair.variable} 
        ${perfectGirlScript.variable} 
        ${perfectGirlSans.variable}
        ${playfairDisplaySc.variable}
        ${euphoriaScript.variable}
        ${haigrastScript.variable}
        ${scriptAlt.variable}
        ${scriptIn.variable}
      `}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}