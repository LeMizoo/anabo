import type { Locale } from '@/lib/i18n'
import { ImagePlaceholder } from './ImagePlaceholder'

type Props = {
  locale: Locale
}

export function ImagePlaceholderGallery({ locale }: Props) {
  return (
    <section className="container-custom">
      <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <ImagePlaceholder
            key={index}
            locale={locale}
            className="aspect-[4/3] rounded-xl"
          />
        ))}
      </div>
    </section>
  )
}
