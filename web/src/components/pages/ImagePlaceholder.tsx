import { Image as ImageIcon } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

type Props = {
  locale: Locale
  className?: string
  variant?: 'tile' | 'cover'
}

const labels: Record<Locale, string> = {
  fr: 'Photo à venir',
  en: 'Photo coming soon',
  it: 'Foto in arrivo',
}

export function ImagePlaceholder({
  locale,
  className = '',
  variant = 'tile',
}: Props) {
  const isCover = variant === 'cover'

  return (
    <div
      role="img"
      aria-label={labels[locale]}
      className={`relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden ${
        isCover
          ? 'bg-gradient-to-br from-slate-700 via-[#06245F] to-slate-900 text-white/75'
          : 'border border-slate-200 bg-gradient-to-br from-slate-100 via-stone-100 to-amber-50 text-slate-400'
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className={`absolute -right-8 -top-10 h-40 w-40 rounded-full ${
          isCover ? 'bg-white/10' : 'bg-[#E0A01C]/10'
        }`}
      />
      <ImageIcon
        size={34}
        strokeWidth={1.5}
        aria-hidden="true"
        className="relative"
      />
      <span className="relative text-sm font-medium">{labels[locale]}</span>
    </div>
  )
}
