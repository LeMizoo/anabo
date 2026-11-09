import { brandTextColor, subtitleSizeClass, titleCase, titleSizeClass } from '@/lib/typography'
import type { HeadingBlock } from '@/lib/types'

type Props = {
  block: HeadingBlock
}

const ALIGNMENT_CLASSES = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
} as const

export function HeadingSection({ block }: Props) {
  if (!block.title && !block.subtitle) return null

  const alignment = ALIGNMENT_CLASSES[block.alignment || 'center']

  return (
    <section className="container-custom">
      <div className={`mx-auto flex max-w-6xl flex-col ${alignment}`}>
        {block.title && (
          <h2
            className={`${block.titleFont || 'font-euphoria'} ${block.titleWeight || 'font-normal'} ${titleSizeClass(block.titleSize)}`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title)}
          </h2>
        )}
        {block.subtitle && (
          <p
            className={`mt-3 whitespace-pre-line ${block.subtitleFont || 'font-sans'} ${block.subtitleWeight || 'font-normal'} ${subtitleSizeClass(block.subtitleSize)}`}
            style={{ color: brandTextColor(block.subtitleColor) }}
          >
            {titleCase(block.subtitle)}
          </p>
        )}
      </div>
    </section>
  )
}
