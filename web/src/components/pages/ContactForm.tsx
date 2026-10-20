'use client'

import { useState, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import type { ContactFormBlock } from '@/lib/types'

type Props = {
  block: ContactFormBlock
}

export function ContactForm({ block }: Props) {
  const pathname = usePathname()
  const firstSegment = pathname.split('/').filter(Boolean)[0]
  const locale = ['fr', 'en', 'it'].includes(firstSegment)
    ? firstSegment
    : 'fr'

  const isQuote = block.formType === 'quote'

  const labels = {
    fr: {
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Adresse e-mail',
      phone: 'Téléphone / WhatsApp',
      country: 'Pays de résidence',
      startDate: 'Date de départ souhaitée',
      endDate: 'Date de retour souhaitée',
      adults: 'Nombre d’adultes',
      children: 'Nombre d’enfants',
      message: 'Votre message',
      submit: isQuote ? 'Demander un devis' : 'Envoyer le message',
      sending: 'Envoi en cours…',
      success: 'Votre demande a bien été enregistrée.',
      reference: 'Référence de votre demande',
      error: 'Une erreur est survenue. Veuillez réessayer.',
      required: 'Veuillez remplir les champs obligatoires.',
    },
    en: {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email address',
      phone: 'Phone / WhatsApp',
      country: 'Country of residence',
      startDate: 'Preferred departure date',
      endDate: 'Preferred return date',
      adults: 'Number of adults',
      children: 'Number of children',
      message: 'Your message',
      submit: isQuote ? 'Request a quote' : 'Send message',
      sending: 'Sending…',
      success: 'Your request has been saved.',
      reference: 'Your request reference',
      error: 'An error occurred. Please try again.',
      required: 'Please complete the required fields.',
    },
    it: {
      firstName: 'Nome',
      lastName: 'Cognome',
      email: 'Indirizzo e-mail',
      phone: 'Telefono / WhatsApp',
      country: 'Paese di residenza',
      startDate: 'Data di partenza desiderata',
      endDate: 'Data di ritorno desiderata',
      adults: 'Numero di adulti',
      children: 'Numero di bambini',
      message: 'Il tuo messaggio',
      submit: isQuote ? 'Richiedi un preventivo' : 'Invia il messaggio',
      sending: 'Invio in corso…',
      success: 'La tua richiesta è stata registrata.',
      reference: 'Riferimento della richiesta',
      error: 'Si è verificato un errore. Riprova.',
      required: 'Compila i campi obbligatori.',
    },
  }[locale as 'fr' | 'en' | 'it']

  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formElement = event.currentTarget
    event.preventDefault()
    setError('')
    setReference('')
    setSending(true)

    const form = new FormData(formElement)

    const payload = {
      locale,
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
        throw new Error(fieldErrors || result.error || labels.error)
      }

      setReference(result.reference || '')
      formElement.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error)
    } finally {
      setSending(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100'

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          {block.title && (
            <h2 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
              {block.title}
            </h2>
          )}

          {block.description && (
            <p className="mb-6 text-gray-600">{block.description}</p>
          )}

          {reference ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-green-900" role="status">
              <p className="font-semibold">{labels.success}</p>
              <p className="mt-2">
                {labels.reference}: <strong>{reference}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  {labels.firstName} *
                  <input
                    className={inputClass}
                    name="firstName"
                    autoComplete="given-name"
                    maxLength={100}
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  {labels.lastName} *
                  <input
                    className={inputClass}
                    name="lastName"
                    autoComplete="family-name"
                    maxLength={100}
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  {labels.email} *
                  <input
                    className={inputClass}
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={191}
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  {labels.phone} *
                  <input
                    className={inputClass}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                  {labels.country}
                  <input
                    className={inputClass}
                    name="country"
                    autoComplete="country-name"
                    maxLength={100}
                  />
                </label>
              </div>

              {isQuote && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {labels.startDate}
                    <input
                      className={inputClass}
                      name="startDate"
                      type="date"
                    />
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    {labels.endDate}
                    <input
                      className={inputClass}
                      name="endDate"
                      type="date"
                    />
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    {labels.adults}
                    <input
                      className={inputClass}
                      name="adults"
                      type="number"
                      min={1}
                      max={20}
                      defaultValue={2}
                      required
                    />
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    {labels.children}
                    <input
                      className={inputClass}
                      name="children"
                      type="number"
                      min={0}
                      max={20}
                      defaultValue={0}
                      required
                    />
                  </label>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700">
                {labels.message}
                <textarea
                  className={inputClass}
                  name="message"
                  rows={5}
                  maxLength={5000}
                />
              </label>

              {error && (
                <p className="text-sm text-red-700" role="alert">
                  {error || labels.required}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center rounded-full bg-primary-600 px-7 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? labels.sending : block.title ? labels.submit : labels.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
