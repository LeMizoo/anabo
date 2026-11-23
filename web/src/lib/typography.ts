import type { BrandTextColor } from './types'

const TITLE_SIZE_CLASSES: Record<string, string> = {
  h1: 'text-[clamp(2rem,5vw,3.75rem)]',
  h2: 'text-[clamp(1.5rem,4vw,3rem)]',
  h3: 'text-[clamp(1.25rem,3.5vw,2.25rem)]',
  sm: 'text-[clamp(1.125rem,3vw,1.875rem)]',
  md: 'text-[clamp(1.25rem,4vw,2.25rem)]',
  lg: 'text-[clamp(1.5rem,4.5vw,3rem)]',
  xl: 'text-[clamp(1.625rem,5vw,3.75rem)]',
  '2xl': 'text-[clamp(2rem,5vw,3.75rem)]',
}

const BRAND_TEXT_COLORS: Record<BrandTextColor, string> = {
  navy: '#06245F',
  gold: '#E0A01C',
  charcoal: '#374151',
  white: '#FFFFFF',
}

export function brandTextColor(color?: BrandTextColor) {
  return color ? BRAND_TEXT_COLORS[color] : undefined
}

const SUBTITLE_SIZE_CLASSES: Record<string, string> = {
  h1: 'text-[clamp(1.5rem,3vw,2.25rem)]',
  h2: 'text-[clamp(1.25rem,2.5vw,1.75rem)]',
  h3: 'text-[clamp(1rem,2vw,1.5rem)]',
  sm: 'text-[clamp(0.875rem,1.75vw,1.125rem)]',
  md: 'text-[clamp(1rem,2.25vw,1.25rem)]',
  lg: 'text-[clamp(1.125rem,2.75vw,1.5rem)]',
  xl: 'text-[clamp(1.25rem,3vw,1.875rem)]',
  '2xl': 'text-[clamp(1.5rem,4vw,2.25rem)]',
}

export function titleSizeClass(size?: string) {
  return TITLE_SIZE_CLASSES[size || 'md'] || TITLE_SIZE_CLASSES.md
}

export function subtitleSizeClass(size?: string) {
  return SUBTITLE_SIZE_CLASSES[size || 'md'] || SUBTITLE_SIZE_CLASSES.md
}

/**
 * Noms propres et sigles qui gardent leur majuscule dans une phrase.
 * (Comparaison insensible à la casse ; la forme ci-dessous est restaurée.)
 */
export const PROPER_NOUNS = [
  'Madagascar', 'Malagasy', 'Vonjy', 'Anabo', 'Roadtrip', 'RN7', 'RN5', 'RN13', 'RN34', 'RN35', 'FCE',
  'Tsingy', 'Bemaraha', 'Morondava', 'Tsiribihina', 'Nosy', 'Be', 'Iranja', 'Komba', 'Andasibe', 'Mantadia',
  'Ranomafana', 'Isalo', 'Ifaty', 'Anakao', 'Toliara', 'Tuléar', 'Antananarivo', 'Tana', 'Antsirabe',
  'Ambositra', 'Ambalavao', 'Anja', 'Fianarantsoa', 'Manakara', 'Ampefy', 'Itasy', 'Lily', 'Analavory',
  'Pangalanes', 'Tsaranoro', 'Andringitra', 'Diego', 'Suarez', 'Ankarafantsika', 'Kirindy', 'Mahajanga',
  'Majunga', 'Sainte-Marie', 'Ankify', 'Ambanja', 'Ankarana', 'Montagne', "d'Ambre", 'Mozambique', 'Afrique',
  'Africa', 'Asie', 'Asia', 'Gondwana', 'Indian', 'Ocean', 'Indien', 'Toyota', 'Prado', 'Land', 'Cruiser',
  'Hyundai', 'Starex', 'WhatsApp', 'Tripadvisor', 'TripAdvisor', 'Google', 'Salama', 'Indri', 'Sud', 'Nord', 'Est',
  'Ouest', 'Grand', 'Hautes', 'Terres', 'Highlands', 'Lemur', 'Coquerel', 'Antaimoro', 'Zafimaniry',
]

const PROPER_MAP = new Map(PROPER_NOUNS.map((word) => [word.toLocaleLowerCase('fr'), word]))

// Mots qui ne gardent leur majuscule que s'ils accompagnent un lieu (« Grand Sud », « Hautes Terres », « Nosy Be »).
const CONTEXTUAL = new Set(['be', 'sud', 'nord', 'est', 'ouest', 'grand', 'hautes', 'terres', 'montagne', 'indian', 'ocean', 'indien', 'land', 'cruiser', 'lemur', 'highlands'])

function isMostlyUppercase(value: string) {
  const letters = value.match(/\p{L}/gu) || []
  if (letters.length < 4) return false
  const upper = letters.filter((char) => char === char.toLocaleUpperCase() && char !== char.toLocaleLowerCase()).length
  return upper / letters.length >= 0.75
}

/**
 * Met un texte en « casse de phrase » : première lettre en majuscule, noms propres
 * conservés. Les textes saisis TOUT EN MAJUSCULES sont remis en minuscules.
 * (Remplace l'ancienne mise en majuscule de chaque mot.)
 */
export function sentenceCase(value: string, locale: string = 'fr') {
  if (!value) return value
  let text = value

  if (isMostlyUppercase(value)) {
    const words = value.toLocaleLowerCase(locale).split(/(\s+)/u)
    text = words
      .map((word, index) => {
        const core = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}'’-]+$/gu, '')
        const proper = PROPER_MAP.get(core.toLocaleLowerCase('fr'))
        if (!proper) return word
        if (CONTEXTUAL.has(core.toLocaleLowerCase('fr'))) {
          const prev = words[index - 2]?.replace(/[^\p{L}]/gu, '').toLocaleLowerCase('fr')
          const next = words[index + 2]?.replace(/[^\p{L}]/gu, '').toLocaleLowerCase('fr')
          const nearPlace = (prev && PROPER_MAP.has(prev) && !CONTEXTUAL.has(prev)) || (next && PROPER_MAP.has(next) && !CONTEXTUAL.has(next))
          if (!nearPlace) return word
        }
        return word.replace(core, proper)
      })
      .join('')
  }

  return text.replace(/^([^\p{L}\p{N}]*)(\p{L})/u, (_, prefix: string, first: string) => `${prefix}${first.toLocaleUpperCase(locale)}`)
}

/** Conservé pour compatibilité : applique désormais la casse de phrase. */
export function titleCase(value: string, locale: string) {
  return sentenceCase(value, locale)
}


const SCRIPT_FONTS = new Set([
  'font-caflisch', 'font-euphoria', 'font-haigrast', 'font-script', 'font-script-alt', 'font-script-in', 'font-perfect-girl-script',
])

/**
 * Police d'un titre : les polices manuscrites ne sont gardées que pour les textes
 * courts (≤ 30 caractères), où elles restent lisibles et élégantes. Au-delà, on passe
 * à une police moderne : Playfair Display (font-serif) pour les titres, sans-serif pour les sous-titres.
 */
export function headingFont(
  font: string | undefined | null,
  text: string | undefined | null,
  options: { fallback?: string; long?: string } = {},
) {
  const chosen = font || options.fallback || 'font-caflisch'
  if (SCRIPT_FONTS.has(chosen) && (text || '').trim().length > 30) {
    return options.long || 'font-serif'
  }
  return chosen
}
