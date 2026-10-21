import type { PageModule, Circuit } from '@/lib/types' // 👈 Ajout de Circuit
import { HeroSection } from './HeroSection'
import { TextMediaSection } from './TextMediaSection'
import { CtaSection } from './CtaSection'
import { ContactForm } from './ContactForm'

type Props = {
  modules?: PageModule[] | null
  circuits?: Circuit[] // 👈 Ajout de la prop optionnelle
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
            // 👇 On passe les circuits au formulaire
            return <ContactForm key={index} block={module} circuits={circuits} />

          default:
            return null
        }
      })}
    </>
  )
}