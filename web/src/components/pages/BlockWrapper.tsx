import type { ReactNode } from 'react'
import type { BlockSettings } from '@/lib/types'

type Props = {
  settings?: BlockSettings
  children: ReactNode
  className?: string
}

const BG_CLASSES = {
  white: 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
  cream: 'bg-[#FDF8F5] dark:bg-gray-800 text-gray-900 dark:text-gray-100',
  navy: 'bg-[#06245F] text-white',
}

const SPACING_CLASSES = {
  sm: 'py-8 md:py-12',
  md: 'py-16 md:py-24',
  lg: 'py-24 md:py-32',
}

export function BlockWrapper({ settings, children, className = '' }: Props) {
  if (settings?.hidden) return null

  const bgClass = BG_CLASSES[settings?.background || 'white']
  const spacingClass = SPACING_CLASSES[settings?.spacing || 'md']

  return (
    <section id={settings?.anchorId} className={`${bgClass} ${spacingClass} ${className}`}>
      {children}
    </section>
  )
}