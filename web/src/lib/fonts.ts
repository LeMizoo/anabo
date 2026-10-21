import { Inter, Poppins, Playfair_Display } from 'next/font/google'

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

// 👇 AJOUT OPTIONNEL : Police pour les grands titres (élégant, style "magazine de voyage")
export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})