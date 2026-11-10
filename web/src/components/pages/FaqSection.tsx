import { PortableText } from '@portabletext/react'
import { brandTextColor, titleCase, titleSizeClass } from '@/lib/typography'
import type { FaqBlock } from '@/lib/types'
import type { Locale } from '@/lib/i18n'

type Props = {
  block: FaqBlock
  locale: Locale
}

export function FaqSection({ block, locale }: Props) {
  const items = block.items?.filter((item) => item.question) ?? []

  if (items.length === 0) return null

  return (
    <section className="container-custom">
      <div className="mx-auto max-w-4xl">
        {block.title && (
          <h2
            className={`mb-6 text-[#06245F] ${block.titleFont || 'font-euphoria'} ${block.titleWeight || 'font-normal'} ${titleSizeClass(block.titleSize)}`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title, locale)}
          </h2>
        )}
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {items.map((item, index) => (
            <details key={item._key || index} className="group py-3">
              <summary className={`cursor-pointer pr-8 text-[clamp(1rem,2vw,1.25rem)] text-gray-900 ${block.titleFont || 'font-euphoria'} ${block.titleWeight || 'font-normal'}`}>
                {titleCase(item.question, locale)}
              </summary>
              {item.answer && (
                <div className="prose mt-4 max-w-none text-gray-700">
                  <PortableText value={item.answer as never} />
                </div>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
