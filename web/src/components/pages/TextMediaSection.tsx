import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { getImageUrl } from '@/lib/sanity'
import type { TextMediaBlock } from '@/lib/types'

type Props = {
  block: TextMediaBlock
}

export function TextMediaSection({ block }: Props) {
  const imageUrl = block.image
    ? getImageUrl(block.image, 1000, 85)
    : null

  const imageFirst = block.imagePosition === 'left'

  return (
    <section className="container-custom py-16 md:py-24">
      <div
        className={`grid items-center gap-10 md:grid-cols-2 ${
          imageFirst ? '' : ''
        }`}
      >
        <div className={imageFirst ? 'md:order-2' : 'md:order-1'}>
          {block.title && (
            <h2 className="text-3xl font-bold text-[#06245F] md:text-4xl">
              {block.title}
            </h2>
          )}

          {block.content && block.content.length > 0 && (
            <div className="prose mt-6 max-w-none">
              <PortableText
                value={block.content as never}
                onMissingComponent={false}
                components={{
                  marks: {
                    link: ({ children, value }) => {
                      const href =
                        typeof value?.href === 'string'
                          ? value.href
                          : '#'

                      return (
                        <a
                          href={href}
                          target={value?.blank ? '_blank' : undefined}
                          rel={
                            value?.blank
                              ? 'noopener noreferrer'
                              : undefined
                          }
                        >
                          {children}
                        </a>
                      )
                    },
                  },
                }}
              />
            </div>
          )}

          {block.cta?.label && block.cta.link && (
            <Link
              href={block.cta.link}
              className="mt-6 inline-flex rounded-lg bg-[#E0A01C] px-6 py-3 font-semibold text-white transition hover:opacity-90"
            >
              {block.cta.label}
            </Link>
          )}
        </div>

        {imageUrl && (
          <div className={imageFirst ? 'md:order-1' : 'md:order-2'}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={imageUrl}
                alt={block.image?.alt || ''}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
