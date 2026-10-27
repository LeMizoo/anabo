import { Inter, Poppins, Playfair_Display } from 'next/font/google'
import localFont from 'next/font/local'

// Police pour le corps de texte (lecture facile, moderne)
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Police pour les boutons, sous-titres (géométrique, sympathique)
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

// Police pour les grands titres (élégant, style "magazine de voyage")
export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

// 👇 Chargement des polices locales Perfect Girl 👇
export const perfectGirlScript = localFont({
  src: '../../public/fonts/PerfectGirl-Script.otf',
  variable: '--font-perfect-script',
  display: 'swap',
})

export const perfectGirlSans = localFont({
  src: '../../public/fonts/PerfectGirl-SansSerif.otf',
  variable: '--font-perfect-sans',
  display: 'swap',
})