import Image from 'next/image'
import Link from 'next/link'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { getImageUrl } from '@/lib/sanity'
import type { TextMediaBlock } from '@/lib/types'
import type { ReactNode } from 'react'

type Props = {
  block: TextMediaBlock
}

const portableTextComponents: PortableTextComponents = {
  list: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <ul className="list-disc pl-6 my-4 space-y-2 text-gray-700">{children}</ul>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <ol className="list-decimal pl-6 my-4 space-y-2 text-gray-700">{children}</ol>
    ),
    checkmarks: ({ children }: { children?: ReactNode }) => (
      <ul className="list-none pl-0 my-4 space-y-2 text-gray-700">{children}</ul>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
    number: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
    checkmarks: ({ children }: { children?: ReactNode }) => (
      <li className="flex items-start gap-3">
        <span className="text-green-600 mt-1 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        <span>{children}</span>
      </li>
    ),
  },
  block: {
    h2: ({ children }: { children?: ReactNode }) => (
      <h3 className="text-2xl font-bold text-[#06245F] mt-8 mb-4 font-serif">{children}</h3>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h4 className="text-xl font-bold text-[#06245F] mt-6 mb-3 font-serif">{children}</h4>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="border-l-4 border-[#E0A01C] pl-4 italic text-gray-600 my-6">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: { children?: ReactNode; value?: { href?: string; blank?: boolean } }) => {
      const href = typeof value?.href === 'string' ? value.href : '#'
      return (
        <a
          href={href}
          target={value?.blank ? '_blank' : undefined}
          rel={value?.blank ? 'noopener noreferrer' : undefined}
          className="text-[#06245F] underline hover:text-[#E0A01C] transition-colors"
        >
          {children}
        </a>
      )
    },
  },
}

export function TextMediaSection({ block }: Props) {
  const imageUrl = block.image ? getImageUrl(block.image, 1000, 85) : null
  const imageFirst = block.imagePosition === 'left'
  const titleFontClass = block.titleFont || 'font-sans'

  // Si le bloc n'a pas d'image, on affiche le texte sur toute la largeur (centré)
  const isTextOnly = !imageUrl

  return (
    <section className="container-custom py-16 md:py-24">
      <div className={`grid items-center gap-10 ${isTextOnly ? 'max-w-4xl mx-auto' : 'md:grid-cols-2'}`}>
        <div className={imageFirst ? 'md:order-2' : 'md:order-1'}>
          {block.title && (
            <h2 className={`text-3xl font-bold text-[#06245F] md:text-4xl ${titleFontClass}`}>
              {block.title}
            </h2>
          )}

          {block.content && block.content.length > 0 && (
            <div className="prose mt-6 max-w-prose">
              <PortableText
                value={block.content as never}
                onMissingComponent={false}
                components={portableTextComponents}
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