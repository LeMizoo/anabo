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

export function titleCase(value: string, locale: string) {
  return value
    .split(/(\s+)/u)
    .map((word) => {
      if (!word.trim()) return word

      return word
        .split(/([-‐‑‒–—])/u)
        .map((part) => {
          if (/^[-‐‑‒–—]$/u.test(part)) return part
          if (/\d/u.test(part) && /^\p{Lu}[\p{Lu}\d]*$/u.test(part)) return part

          return part.toLocaleLowerCase(locale).replace(
            /^([^\p{L}\p{N}]*)([\p{L}\p{N}])/u,
            (_, prefix: string, initial: string) =>
              `${prefix}${initial.toLocaleUpperCase(locale)}`,
          )
        })
        .join('')
    })
    .join('')
}
