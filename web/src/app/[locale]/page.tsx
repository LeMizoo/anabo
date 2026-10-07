import { setRequestLocale } from 'next-intl/server'
import { type Locale } from '@/lib/i18n'

type Props = {
  params: Promise<{ locale: Locale }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="container-custom py-20">
      <h1 className="text-5xl font-bold text-primary-600 mb-6">
        ANABO ROADTRIP MADAGASCAR
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        🚧 Site en cours de construction 🚧
      </p>
      <p className="text-lg text-gray-500">
        Locale active : <strong>{locale}</strong>
      </p>
    </div>
  )
}
