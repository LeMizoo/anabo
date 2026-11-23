import Link from 'next/link'
import type { CtaBlock } from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import { brandTextColor, titleCase, titleSizeClass, headingFont } from '@/lib/typography'
import { localizeInternalPath } from '@/lib/localized-path'

type Props = {
  block: CtaBlock
  locale: Locale
}

export function CtaSection({ block, locale }: Props) {
  const secondary = block.variant === 'secondary'

  return (
    <section className="container-custom">
      <div
        className={`rounded-2xl px-6 py-12 text-center md:px-12 ${
          secondary
            ? 'border border-[#06245F] bg-white'
            : 'bg-[#06245F]'
        }`}
      >
        {block.title && (
          <h2
            className={`${titleSizeClass(block.titleSize)} ${headingFont(block.titleFont, block.title)} ${block.titleWeight || 'font-normal'} ${
              secondary ? 'text-[#06245F]' : 'text-white'
            }`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title, locale)}
          </h2>
        )}

        {block.description && (
          <p
            className={`mx-auto mt-4 max-w-2xl ${
              secondary ? 'text-gray-600' : 'text-white/85'
            }`}
          >
            {block.description}
          </p>
        )}

        {block.buttonLabel && block.buttonLink && (
          <Link
            href={localizeInternalPath(block.buttonLink, locale)}
            className={`mt-7 inline-flex rounded-lg px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${
              secondary
                ? 'bg-[#06245F] text-white hover:bg-[#0b347d]'
                : 'bg-[#E0A01C] text-white hover:bg-[#c9870a]'
            }`}
          >
            {block.buttonLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
