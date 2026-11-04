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
  sm: 'py-3 md:py-4',
  md: 'py-6 md:py-8',
  lg: 'py-10 md:py-12',
}

export function BlockWrapper({ settings, children, className = '' }: Props) {
  if (settings?.hidden) return null

  const bgClass = BG_CLASSES[settings?.background || 'white']
  const spacingClass = SPACING_CLASSES[settings?.spacing || 'md']
  const contentWidth = settings?.contentWidth || 'standard'

  return (
    <section
      id={settings?.anchorId}
      data-block-width={contentWidth}
      className={`${bgClass} ${spacingClass} ${className}`}
    >
      {children}
    </section>
  )
}