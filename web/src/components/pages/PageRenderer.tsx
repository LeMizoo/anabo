import type { PageModule, Circuit } from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import { BlockWrapper } from './BlockWrapper'
import { HeroSection } from './HeroSection'
import { TextMediaSection } from './TextMediaSection'
import { CtaSection } from './CtaSection'
import { ContactForm } from './ContactForm'
import { Slider3D } from './Slider3D'
import { PuzzleGallery } from './PuzzleGallery'
import { AlternatingSection } from './AlternatingSection'
import { Features } from './Features'
import { CommitmentsSection } from './CommitmentsSection'
import { TestimonialsSection } from './TestimonialsSection'
import { GallerySection } from './GallerySection'
import { ImageBlockSection } from './ImageBlockSection'
import { HeadingSection } from './HeadingSection'
import { FaqSection } from './FaqSection'
import { TrustindexWidget } from './TrustindexWidget'
import { CardsSection } from './CardsSection'

type Props = {
  modules?: PageModule[] | null
  circuits?: Circuit[]
  globalHeadingFont?: string
  globalHeadingWeight?: string
  locale: Locale
}

export function PageRenderer({ modules, circuits = [], globalHeadingFont, globalHeadingWeight, locale }: Props) {
  const safeModules = Array.isArray(modules) ? modules : []

  return (
    <>
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
            case 'headingBlock':
              return <HeadingSection block={module} locale={locale} />
            case 'faqBlock':
              return <FaqSection block={module} locale={locale} />
            case 'tripadvisorBlock':
              return (
                <TrustindexWidget
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