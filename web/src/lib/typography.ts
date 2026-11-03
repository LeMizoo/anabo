const TITLE_SIZE_CLASSES: Record<string, string> = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-3xl md:text-4xl',
  lg: 'text-4xl md:text-5xl',
  xl: 'text-5xl md:text-6xl',
  '2xl': 'text-6xl md:text-7xl',
}

const SUBTITLE_SIZE_CLASSES: Record<string, string> = {
  sm: 'text-base md:text-lg',
  md: 'text-lg md:text-xl',
  lg: 'text-xl md:text-2xl',
  xl: 'text-2xl md:text-3xl',
  '2xl': 'text-3xl md:text-4xl',
}

export function titleSizeClass(size?: string) {
  return TITLE_SIZE_CLASSES[size || 'md'] || TITLE_SIZE_CLASSES.md
}

export function subtitleSizeClass(size?: string) {
  return SUBTITLE_SIZE_CLASSES[size || 'md'] || SUBTITLE_SIZE_CLASSES.md
}
