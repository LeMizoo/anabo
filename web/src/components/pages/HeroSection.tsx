import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/sanity'
import type { HeroBlock } from '@/lib/types'

type Props = {
  block: HeroBlock
}

export function HeroSection({ block }: Props) {
  const alignment =
    block.alignment === 'left'
      ? 'items-start text-left'
      : block.alignment === 'right'
        ? 'items-end text-right'
        : 'items-center text-center'

  const imageUrl = block.backgroundImage
    ? getImageUrl(block.backgroundImage, 1920, 85)
    : null

  return (
    <section className="relative min-h-[520px] overflow-hidden bg-[#06245F]">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={block.backgroundImage?.alt || ''}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}

      {block.overlay !== false && (
        <div className="absolute inset-0 bg-black/45" />
      )}

      <div className="container-custom relative z-10 flex min-h-[520px] flex-col justify-center py-20">
        <div className={`flex max-w-4xl flex-col ${alignment}`}>
          <h1 className="text-4xl font-bold text-white md:text-6xl">
            {block.title}
          </h1>

          {block.subtitle && (
            <p className="mt-5 max-w-2xl text-lg text-white/90 md:text-xl">
              {block.subtitle}
            </p>
          )}

          {(block.ctaPrimary?.label || block.ctaSecondary?.label) && (
            <div className="mt-8 flex flex-wrap gap-4">
              {block.ctaPrimary?.label && block.ctaPrimary.link && (
                <Link
                  href={block.ctaPrimary.link}
                  className="rounded-lg bg-[#E0A01C] px-6 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  {block.ctaPrimary.label}
                </Link>
              )}

              {block.ctaSecondary?.label && block.ctaSecondary.link && (
                <Link
                  href={block.ctaSecondary.link}
                  className="rounded-lg border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-[#06245F]"
                >
                  {block.ctaSecondary.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
