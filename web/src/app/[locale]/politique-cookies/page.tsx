import { getTranslations } from 'next-intl/server'
import { titleCase, titleSizeClass } from '@/lib/typography'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function PolitiqueCookies({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cookiePolicy' })

  return (
    <div className="container-custom max-w-4xl mx-auto py-20 px-4">
      <h1 className={`font-bold text-[#06245F] mb-8 ${titleSizeClass('lg')}`}>
        {titleCase(t('title'), locale)}
      </h1>
      
      <div className="prose prose-gray max-w-none">
        <h2 className="text-[clamp(1.25rem,3vw,1.875rem)]">{titleCase(t('whatIsCookie'), locale)}</h2>
        <p>{t('cookieDescription')}</p>

        <h2 className="text-[clamp(1.25rem,3vw,1.875rem)]">{titleCase(t('cookiesWeUse'), locale)}</h2>
        <ul>
          <li>
            <strong>{t('necessaryLabel')}</strong> {t('necessaryDescription')}
          </li>
          <li>
            <strong>{t('thirdPartyLabel')}</strong> {t('thirdPartyDescription')}
          </li>
        </ul>

        <h2 className="text-[clamp(1.25rem,3vw,1.875rem)]">{titleCase(t('manageChoices'), locale)}</h2>
        <p>{t('manageChoicesDescription')}</p>

        <h2 className="text-[clamp(1.25rem,3vw,1.875rem)]">{titleCase(t('contact'), locale)}</h2>
        <p>{t('contactDescription')} contact@anabo.mg</p>
      </div>
    </div>
  )
}