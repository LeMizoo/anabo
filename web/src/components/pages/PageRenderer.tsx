import type { PageModule, Circuit } from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import { BlockWrapper } from './BlockWrapper'
import { HeroSection } from './HeroSection'
import { TextMediaSection } from './TextMediaSection'
import { CtaSection } from './CtaSection'
import { ContactForm } from './ContactForm'
import { CustomQuoteForm } from './CustomQuoteForm'
import { Slider3D } from './Slider3D'
import { PuzzleGallery } from './PuzzleGallery'
import { AlternatingSection } from './AlternatingSection'
import { Features } from './Features'
import { CommitmentsSection } from './CommitmentsSection'
import { TestimonialsSection } from './TestimonialsSection'
import { GallerySection } from './GallerySection'
import { ImageBlockSection } from './ImageBlockSection'
import { ImageMarquee } from './ImageMarquee'
import { HeadingSection } from './HeadingSection'
import { FaqSection } from './FaqSection'
import { JotformWidget } from './JotformWidget'
import { CardsSection } from './CardsSection'

type Props = {
  modules?: PageModule[] | null
  circuits?: Circuit[]
  globalHeadingFont?: string
  globalHeadingWeight?: string
  locale: Locale
  sectionLinks?: boolean
}

function makeSectionId(title: string, index: number) {
  const slug = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `section-${slug || 'content'}-${index + 1}`
}

function isNavigableModule(module: PageModule): module is PageModule & { title: string } {
  return (
    'title' in module &&
    typeof module.title === 'string' &&
    module.title.length > 0 &&
    module._type !== 'heroBlock' &&
    module._type !== 'ctaBlock' &&
    !module.settings?.hidden
  )
}

export function PageRenderer({ modules, circuits = [], globalHeadingFont, globalHeadingWeight, locale, sectionLinks = false }: Props) {
  const sourceModules = Array.isArray(modules) ? modules : []
  const safeModules = sourceModules.map((module, index) => {
    if (!sectionLinks || !('title' in module) || !module.title || module._type === 'heroBlock') return module
    const settings = module.settings || {}
    return { ...module, settings: { ...settings, anchorId: settings.anchorId || makeSectionId(module.title, index) } }
  })
  const navigableModules = sectionLinks
    ? safeModules.filter(isNavigableModule)
    : []
  const sectionNavLabel = {
    fr: 'Aller à une section',
    en: 'Jump to a section',
    it: 'Vai a una sezione',
  }[locale]

  return (
    <>
      {navigableModules.length >= 3 && (
        <nav className="container-custom mx-auto max-w-6xl px-4 py-4" aria-label={sectionNavLabel}>
          <details className="group rounded-xl border border-slate-200 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-[#06245F] marker:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A01C]">
              {sectionNavLabel}
              <span aria-hidden="true" className="text-[#E0A01C] transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="grid max-h-64 gap-1 overflow-y-auto border-t border-slate-100 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {navigableModules.map((module, index) => {
                const anchor = module.settings?.anchorId || makeSectionId(module.title, index)
                return <a key={anchor} href={`#${anchor}`} className="rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-amber-50 hover:text-[#06245F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A01C]">{module.title}</a>
              })}
            </div>
          </details>
        </nav>
      )}
      {safeModules.map((module, index) => {
        const settings = module.settings

        if (settings?.hidden) return null

        const content = (() => {
          switch (module._type) {
            case 'heroBlock':
              return <HeroSection block={module} locale={locale} />
            case 'textMediaBlock':
              return <TextMediaSection block={module} locale={locale} />
            case 'ctaBlock':
              return <CtaSection block={module} locale={locale} />
            case 'contactFormBlock':
              return <ContactForm block={module} circuits={circuits} />
            case 'customQuoteBlock':
              return <CustomQuoteForm block={module} locale={locale} />
            case 'slider3dBlock':
              return <Slider3D block={module} locale={locale} />
            case 'puzzleGalleryBlock':
              return <PuzzleGallery block={module} locale={locale} />
            case 'alternatingBlock':
              return <AlternatingSection block={module} locale={locale} globalHeadingFont={globalHeadingFont} globalHeadingWeight={globalHeadingWeight} />
            case 'cardsBlock':
              return <CardsSection block={module} locale={locale} globalHeadingFont={globalHeadingFont} globalHeadingWeight={globalHeadingWeight} />
            case 'featuresBlock':
              return <Features block={module} locale={locale} globalHeadingFont={globalHeadingFont} globalHeadingWeight={globalHeadingWeight} />
            case 'commitmentsBlock':
              return <CommitmentsSection block={module} locale={locale} globalHeadingFont={globalHeadingFont} globalHeadingWeight={globalHeadingWeight} />
            case 'testimonialBlock':
              return <TestimonialsSection block={module} locale={locale} />
            case 'galleryBlock':
              return <GallerySection block={module} locale={locale} />
            case 'imageBlock':
              return <ImageBlockSection block={module} locale={locale} />
            case 'imageMarqueeBlock':
              return <ImageMarquee block={module} locale={locale} />
            case 'headingBlock':
              return <HeadingSection block={module} locale={locale} />
            case 'faqBlock':
              return <FaqSection block={module} locale={locale} />
            case 'tripadvisorBlock':
              return (
                <JotformWidget
                  title={module.title}
                  titleFont={module.titleFont}
                  titleWeight={module.titleWeight}
                  titleColor={module.titleColor}
                  titleSize={module.titleSize}
                />
              )
            default:
              return null
          }
        })()

        if (!content) return null

        // Le Hero gère son propre plein écran, on ne l'enveloppe pas
        if (module._type === 'heroBlock') {
          return (
            <div
              key={index}
              id={settings?.anchorId}
              data-block-width={settings?.contentWidth || 'standard'}
            >
              {content}
            </div>
          )
        }

        return (
          <BlockWrapper key={index} settings={settings}>
            {content}
          </BlockWrapper>
        )
      })}
    </>
  )
}
