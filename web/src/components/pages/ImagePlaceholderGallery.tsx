import { Image as ImageIcon } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

type Props = {
  locale: Locale
}

const labels: Record<Locale, string> = {
  fr: 'Photos à venir',
  en: 'Photos coming soon',
  it: 'Foto in arrivo',
}

export function ImagePlaceholderGallery({ locale }: Props) {
  return (
    <section className="container-custom" aria-label={labels[locale]}>
      <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="relative flex aspect-[4/3] flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 via-stone-100 to-amber-50 text-slate-400"
          >
            <div
              aria-hidden="true"
              className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#E0A01C]/10"
            />
            <ImageIcon size={34} strokeWidth={1.5} aria-hidden="true" />
            <span className="text-sm font-medium">{labels[locale]}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
