import type { PageModule, Circuit } from '@/lib/types'
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

type Props = {
  modules?: PageModule[] | null
  circuits?: Circuit[]
  globalHeadingFont?: string
  globalHeadingWeight?: string
}

export function PageRenderer({ modules, circuits = [], globalHeadingFont, globalHeadingWeight }: Props) {
  const safeModules = Array.isArray(modules) ? modules : []

  return (
    <>
      {safeModules.map((module, index) => {
        const settings = module.settings

        if (settings?.hidden) return null

        const content = (() => {
          switch (module._type) {
            case 'heroBlock':
              return <HeroSection block={module} />
            case 'textMediaBlock':
              return <TextMediaSection block={module} />
            case 'ctaBlock':
              return <CtaSection block={module} />
            case 'contactFormBlock':
              return <ContactForm block={module} circuits={circuits} />
            case 'slider3dBlock':
              return <Slider3D block={module} />
            case 'puzzleGalleryBlock':
              return <PuzzleGallery block={module as any} />
            case 'alternatingBlock':
              return <AlternatingSection block={module as any} globalHeadingFont={globalHeadingFont} globalHeadingWeight={globalHeadingWeight} />
            case 'featuresBlock':
              return <Features block={module as any} globalHeadingFont={globalHeadingFont} globalHeadingWeight={globalHeadingWeight} />
            case 'commitmentsBlock':
              return <CommitmentsSection block={module as any} globalHeadingFont={globalHeadingFont} globalHeadingWeight={globalHeadingWeight} />
            case 'testimonialBlock':
              return <TestimonialsSection block={module as any} />
            case 'galleryBlock':
              return <GallerySection block={module} />
            case 'imageBlock':
              return <ImageBlockSection block={module} />
            case 'headingBlock':
              return <HeadingSection block={module} />
            case 'faqBlock':
              return <FaqSection block={module} />
            case 'tripadvisorBlock':
              return (
                <TrustindexWidget
                  title={module.title}
                  titleFont={module.titleFont}
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