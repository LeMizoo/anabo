import localFont from 'next/font/local'

export const dmSans = localFont({
  src: '../../public/fonts/dm-sans-latin.woff2',
  weight: '100 1000',
  variable: '--font-dm-sans',
  display: 'swap',
})

// Police pour le corps de texte (lecture facile, moderne)
export const inter = localFont({
  src: [
    {
      path: '../../public/fonts/inter-v20-latin-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter-v20-latin-600.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter-v20-latin-700.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter-v20-latin-900.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
})

// Police pour les boutons, sous-titres (géométrique, sympathique)
export const poppins = localFont({
  src: [
    {
      path: '../../public/fonts/poppins-v24-latin-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/poppins-v24-latin-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/poppins-v24-latin-600.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/poppins-v24-latin-700.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/poppins-v24-latin-800.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/poppins-v24-latin-900.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-poppins',
  display: 'swap',
})

// Police pour les grands titres (élégant, style "magazine de voyage")
export const playfair = localFont({
  src: [
    {
      path: '../../public/fonts/playfair-display-v40-latin-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/playfair-display-v40-latin-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/playfair-display-v40-latin-600.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/playfair-display-v40-latin-700.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/playfair-display-v40-latin-800.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/playfair-display-v40-latin-900.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-playfair',
  display: 'swap',
})

// Polices locales Perfect Girl
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

export const playfairDisplaySc = localFont({
  src: [
    {
      path: '../../public/fonts/playfair-display-sc-v18-latin-regular.woff2',
      weight: '400',
    },
    {
      path: '../../public/fonts/playfair-display-sc-v18-latin-900.woff2',
      weight: '900',
    },
  ],
  variable: '--font-playfair-sc',
  display: 'swap',
})

export const euphoriaScript = localFont({
  src: '../../public/fonts/euphoria-script-v22-latin_latin-ext-regular.woff2',
  variable: '--font-euphoria',
  display: 'swap',
})

export const haigrastScript = localFont({
  src: '../../public/fonts/HaigrastScript_PERSONAL_USE_ONLY.otf',
  variable: '--font-haigrast',
  display: 'swap',
})

export const scriptAlt = localFont({
  src: '../../public/fonts/SCRIPALT.ttf',
  variable: '--font-script-alt',
  display: 'swap',
})

export const scriptIn = localFont({
  src: '../../public/fonts/SCRIPTIN.ttf',
  variable: '--font-script-in',
  display: 'swap',
})