import type { PageModule, Circuit } from '@/lib/types'
import { HeroSection } from './HeroSection'
import { TextMediaSection } from './TextMediaSection'
import { CtaSection } from './CtaSection'
import { ContactForm } from './ContactForm'
import { Slider3D } from './Slider3D'
import { PuzzleGallery } from './PuzzleGallery'
import { AlternatingSection } from './AlternatingSection'

type Props = {
  modules?: PageModule[] | null
  circuits?: Circuit[]
}

export function PageRenderer({ modules, circuits = [] }: Props) {
  const safeModules = Array.isArray(modules) ? modules : []

  return (
    <>
      {safeModules.map((module, index) => {
        switch (module._type) {
          case 'heroBlock':
            return <HeroSection key={index} block={module} />
          case 'textMediaBlock':
            return <TextMediaSection key={index} block={module} />
          case 'ctaBlock':
            return <CtaSection key={index} block={module} />
          case 'contactFormBlock':
            return <ContactForm key={index} block={module} circuits={circuits} />
          case 'slider3dBlock':
            return <Slider3D key={index} block={module} />
          // 👇 Nouveaux blocs ajoutés 👇
          case 'puzzleGalleryBlock':
            return <PuzzleGallery key={index} block={module as any} />
          case 'alternatingBlock':
            return <AlternatingSection key={index} block={module as any} />
          default:
            return null
        }
      })}
    </>
  )
}