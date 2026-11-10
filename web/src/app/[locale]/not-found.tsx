import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { MapPin, ArrowLeft, Compass } from 'lucide-react'

export default async function NotFound() {
  const t = await getTranslations('NotFound')

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-[#06245F] px-4 py-20 text-center">
      {/* Motif de fond subtil (optionnel) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#28528D] via-[#06245F] to-[#04183E] opacity-50" />
      
      <div className="relative z-10 mx-auto max-w-2xl">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
          <MapPin size={16} aria-hidden="true" />
          {t('badge')}
        </span>

        <h1 className="font-script text-6xl text-[#E0A01C] md:text-8xl">
          404
        </h1>
        
        <h2 className="mt-4 font-script text-3xl text-white md:text-5xl">
          {t('title')}
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-white/80 md:text-lg">
          {t('description')}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#E0A01C] px-8 py-4 font-semibold text-white transition hover:bg-[#c98b13] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowLeft size={18} />
            {t('backHome')}
          </Link>
          
          <Link
            href="/tour-ideas"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-[#06245F] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Compass size={18} />
            {t('exploreTours')}
          </Link>
        </div>
      </div>
    </div>
  )
}