'use client'

import { useState, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { ContactFormBlock } from '@/lib/types'
import { brandTextColor, titleSizeClass } from '@/lib/typography'

type Circuit = {
  slug: string
  title: string
}

type Props = {
  block: ContactFormBlock
  circuits?: Circuit[]
}

export function ContactForm({ block, circuits = [] }: Props) {
  const pathname = usePathname()
  const firstSegment = pathname.split('/').filter(Boolean)[0]
  const locale = ['fr', 'en', 'it'].includes(firstSegment) ? firstSegment : 'fr'

  // 👇 Récupération des traductions 👇
  const t = useTranslations('contactForm')

  const isQuote = block.formType === 'quote'

  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')
  
  const [selectedCircuit, setSelectedCircuit] = useState('')
  const [extraCircuits, setExtraCircuits] = useState<string[]>([])

  const toggleExtraCircuit = (slug: string) => {
    setExtraCircuits(prev => 
      prev.includes(slug) 
        ? prev.filter(item => item !== slug) 
        : [...prev, slug]
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formElement = event.currentTarget
    event.preventDefault()
    setError('')
    setReference('')
    setSending(true)

    const form = new FormData(formElement)

    const circuitSlug = String(form.get('circuitSlug') || '')
    let circuitTitle = circuits.find(c => c.slug === circuitSlug)?.title || ''

    if (extraCircuits.length > 0) {
      const extraTitles = extraCircuits.map(slug => circuits.find(c => c.slug === slug)?.title).filter(Boolean)
      if (circuitTitle) {
        circuitTitle += ` + Extensions : ${extraTitles.join(', ')}`
      } else {
        circuitTitle = `Extensions : ${extraTitles.join(', ')}`
      }
    }

    const payload = {
      locale,
      circuitSlug: circuitSlug || (extraCircuits.length > 0 ? 'extensions' : ''),
      circuitTitle,
      firstName: String(form.get('firstName') || '').trim(),
      lastName: String(form.get('lastName') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      country: String(form.get('country') || '').trim(),
      startDate: String(form.get('startDate') || ''),
      endDate: String(form.get('endDate') || ''),
      adults: Number(form.get('adults') || 2),
      children: Number(form.get('children') || 0),
      message: String(form.get('message') || '').trim(),
    }

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        const fieldErrors = result.fields
          ? Object.values(result.fields).flat().filter(Boolean).join(' ')
          : ''
        throw new Error(fieldErrors || result.error || t('error'))
      }

      setReference(result.reference || '')
      formElement.reset()
      setSelectedCircuit('')
      setExtraCircuits([])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    } finally {
      setSending(false)
    }
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-gray-100'

  return (
    <section>
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          {block.title && (
            <h2
              className={`mb-3 font-bold text-gray-900 ${titleSizeClass(block.titleSize)} ${block.titleFont || 'font-sans'}`}
              style={{ color: brandTextColor(block.titleColor) }}
            >
              {block.title}
            </h2>
          )}
          {block.description && <p className="mb-6 text-gray-600">{block.description}</p>}

          {reference ? (
            <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-5 text-green-900" role="status" aria-live="polite">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">{t('success')}</p>
                <p className="mt-2">{t('reference')}: <strong>{reference}</strong></p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" aria-busy={sending}>
              
              {isQuote && circuits.length > 0 && (
                <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                  <label htmlFor="circuitSlug" className="block text-sm font-medium text-gray-700">
                    {t('circuit')}
                    <select
                      id="circuitSlug"
                      className={inputClass}
                      name="circuitSlug"
                      value={selectedCircuit}
                      onChange={(e) => setSelectedCircuit(e.target.value)}
                      disabled={sending}
                    >
                      <option value="">{t('circuitDefault')}</option>
                      {circuits.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.title}</option>
                      ))}
                    </select>
                  </label>

                  <div className="pt-2">
                    <p className="mb-2 text-sm font-medium text-gray-700">{t('circuitExtras')}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {circuits.map((c) => {
                        if (c.slug === selectedCircuit) return null
                        return (
                          <label key={c.slug} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                            <input
                              type="checkbox"
                              value={c.slug}
                              checked={extraCircuits.includes(c.slug)}
                              onChange={() => toggleExtraCircuit(c.slug)}
                              disabled={sending}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            {c.title}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('firstName')} *
                  <input className={inputClass} name="firstName" autoComplete="given-name" maxLength={100} required disabled={sending} />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  {t('lastName')} *
                  <input className={inputClass} name="lastName" autoComplete="family-name" maxLength={100} required disabled={sending} />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  {t('email')} *
                  <input className={inputClass} name="email" type="email" autoComplete="email" maxLength={191} required disabled={sending} />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  {t('phone')} *
                  <input className={inputClass} name="phone" type="tel" autoComplete="tel" maxLength={40} required disabled={sending} />
                </label>

                <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                  {t('country')}
                  <input className={inputClass} name="country" autoComplete="country-name" maxLength={100} disabled={sending} />
                </label>
              </div>

              {isQuote && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('startDate')}
                    <input className={inputClass} name="startDate" type="date" disabled={sending} />
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    {t('endDate')}
                    <input className={inputClass} name="endDate" type="date" disabled={sending} />
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    {t('adults')}
                    <input className={inputClass} name="adults" type="number" min={1} max={20} defaultValue={2} required disabled={sending} />
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    {t('children')}
                    <input className={inputClass} name="children" type="number" min={0} max={20} defaultValue={0} required disabled={sending} />
                  </label>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700">
                {t('message')}
                <textarea className={inputClass} name="message" rows={5} maxLength={5000} disabled={sending} />
              </label>

              {error && (
                <p className="flex items-start gap-2 text-sm text-red-700" role="alert">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {error || t('required')}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                aria-live="polite"
                className="inline-flex min-w-48 items-center justify-center gap-2 rounded-full bg-primary-600 px-7 py-3 font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {sending ? t('sending') : isQuote ? t('submitQuote') : t('submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}