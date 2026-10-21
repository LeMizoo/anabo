import type { PageModule } from '@/lib/types'
import { HeroSection } from './HeroSection'
import { TextMediaSection } from './TextMediaSection'
import { CtaSection } from './CtaSection'
import { ContactForm } from './ContactForm'

type Props = {
  modules?: PageModule[] | null
}

export function PageRenderer({ modules }: Props) {
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
            return <ContactForm key={index} block={module} />

          default:
            return null
        }
      })}
    </>
  )
}
