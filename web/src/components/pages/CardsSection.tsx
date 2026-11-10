import Image from 'next/image'
import Link from 'next/link'
import type { CardsBlock } from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import { getImageUrl } from '@/lib/sanity'
import { brandTextColor, titleCase, titleSizeClass } from '@/lib/typography'
import { localizeInternalPath } from '@/lib/localized-path'
import { ImageFrame, imageContentStyle } from './ImageFrame'

type Props = {
  block: CardsBlock
  locale: Locale
  globalHeadingFont?: string
  globalHeadingWeight?: string
}

const columnClasses = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
}

const cardStyleClasses = {
  simple: '',
  bordered: 'border border-gray-200 dark:border-gray-700',
  shadow: 'shadow-md',
}

const backgroundClasses = {
  white: 'bg-white dark:bg-gray-900',
  cream: 'bg-[#FDF8F5] dark:bg-gray-800',
  navy: 'bg-[#06245F] text-white',
}

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
}

export function CardsSection({
  block,
  locale,
  globalHeadingFont,
  globalHeadingWeight,
}: Props) {
  const columns = columnClasses[block.columns || '3']
  const cardStyle = cardStyleClasses[block.cardStyle || 'shadow']
  const background = backgroundClasses[block.backgroundColor || 'white']
  const alignment = alignmentClasses[block.textAlignment || 'left']
  const reverseImage = block.imagePosition === 'bottom'
  const descriptionColor =
    block.backgroundColor === 'navy'
      ? 'text-white/85'
      : 'text-gray-700 dark:text-gray-300'

  return (
    <section className="container-custom">
      {block.title && (
        <h2
          className={`mb-4 text-center ${titleSizeClass(block.titleSize)} ${
            block.titleFont || globalHeadingFont || 'font-euphoria'
          } ${block.titleWeight || globalHeadingWeight || 'font-normal'}`}
          style={{ color: brandTextColor(block.titleColor) }}
        >
          {titleCase(block.title, locale)}
        </h2>
      )}
      {block.description && (
        <p className="mx-auto mb-8 max-w-3xl text-center leading-relaxed text-gray-700 dark:text-gray-300">
          {block.description}
        </p>
      )}
      {block.cards?.length ? (
        <div className={`grid grid-cols-1 gap-6 ${columns}`}>
          {block.cards.map((card, index) => {
            const imageUrl = card.image
              ? getImageUrl(card.image, 700, 85)
              : null
            const cardTitleColor =
              card.titleColor ||
              (block.backgroundColor === 'navy' ? 'white' : undefined)

            return (
              <article
                key={card._key || index}
                className={`flex min-w-0 flex-col overflow-hidden rounded-xl ${cardStyle} ${background}`}
              >
                {card.image && (
                  <div
                    className={`px-4 pt-4 ${
                      reverseImage ? 'order-2 pb-4 pt-0' : ''
                    }`}
                  >
                    <ImageFrame
                      className="relative aspect-[4/3] w-full"
                      presentation={card.image.presentation}
                    >
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={card.image.alt || card.title || ''}
                          fill
                          className="transition-transform duration-500 hover:scale-105"
                          style={imageContentStyle(card.image.presentation)}
                        />
                      )}
                    </ImageFrame>
                  </div>
                )}
                <div
                  className={`flex flex-1 flex-col p-5 ${alignment} ${
                    reverseImage ? 'order-1' : ''
                  }`}
                >
                  {card.title && (
                    <h3
                      className={`mb-3 w-full ${titleSizeClass(card.titleSize || 'h3')} ${
                        card.titleFont || 'font-euphoria'
                      } ${card.titleWeight || 'font-normal'}`}
                      style={{ color: brandTextColor(cardTitleColor) }}
                    >
                      {titleCase(card.title, locale)}
                    </h3>
                  )}
                  {card.description && (
                    <p className={`w-full flex-1 leading-relaxed ${descriptionColor}`}>
                      {card.description}
                    </p>
                  )}
                  {card.cta?.label && card.cta.link && (
                    <Link
                      href={localizeInternalPath(card.cta.link, locale)}
                      className={`mt-5 inline-flex rounded-lg px-5 py-2.5 font-semibold text-white transition hover:opacity-90 ${
                        block.backgroundColor === 'navy'
                          ? 'bg-[#E0A01C]'
                          : 'bg-[#06245F]'
                      }`}
                    >
                      {card.cta.label}
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
