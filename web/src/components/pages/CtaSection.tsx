import Link from 'next/link'
import type { CtaBlock } from '@/lib/types'

type Props = {
  block: CtaBlock
}

export function CtaSection({ block }: Props) {
  const secondary = block.variant === 'secondary'

  return (
    <section className="container-custom py-16 md:py-24">
      <div
        className={`rounded-2xl px-6 py-12 text-center md:px-12 ${
          secondary
            ? 'border border-[#06245F] bg-white'
            : 'bg-[#06245F]'
        }`}
      >
        {block.title && (
          <h2
            className={`text-3xl font-bold md:text-4xl ${
              secondary ? 'text-[#06245F]' : 'text-white'
            }`}
          >
            {block.title}
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
            href={block.buttonLink}
            className={`mt-7 inline-flex rounded-lg px-6 py-3 font-semibold transition ${
              secondary
                ? 'bg-[#06245F] text-white hover:opacity-90'
                : 'bg-[#E0A01C] text-white hover:opacity-90'
            }`}
          >
            {block.buttonLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
