'use client'

import { useEffect, useState } from 'react'
import { removePushSubscription, savePushSubscription, sendTestPush } from '@/app/admin/push-actions'

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (char) => char.charCodeAt(0))
}

type State = 'loading' | 'unsupported' | 'denied' | 'off' | 'on'

export function PushToggle() {
  const [state, setState] = useState<State>('loading')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!PUBLIC_KEY || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }
    navigator.serviceWorker
      .getRegistration('/admin/')
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => setState(sub ? 'on' : 'off'))
      .catch(() => setState('off'))
  }, [])

  async function enable() {
    setBusy(true)
    setMessage('')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'off')
        return
      }
      const reg = await navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin/' })
      await navigator.serviceWorker.ready
      const sub =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY) }))
      await savePushSubscription(JSON.parse(JSON.stringify(sub)), navigator.userAgent)
      setState('on')
      setMessage('Notifications activées sur cet appareil.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Activation impossible.')
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    setBusy(true)
    setMessage('')
    try {
      const reg = await navigator.serviceWorker.getRegistration('/admin/')
      const sub = await reg?.pushManager.getSubscription()
      if (sub) {
        await removePushSubscription(sub.endpoint)
        await sub.unsubscribe()
      }
      setState('off')
    } finally {
      setBusy(false)
    }
  }

  async function test() {
    setBusy(true)
    const result = await sendTestPush()
    setMessage(result.error || (result.sent ? `Test envoyé (${result.sent} appareil(s)).` : 'Aucun appareil n’a reçu le test.'))
    setBusy(false)
  }

  if (state === 'loading') return null
  if (state === 'unsupported') {
    return <p className="text-xs text-gray-400">Notifications push indisponibles sur ce navigateur (sur iPhone : ajoutez d’abord le site à l’écran d’accueil).</p>
  }
  if (state === 'denied') {
    return <p className="text-xs text-gray-400">Notifications bloquées : autorisez-les dans les réglages du navigateur pour ce site.</p>
  }

  return (
    <div className="space-y-2">
      {state === 'off' ? (
        <button type="button" onClick={enable} disabled={busy} className="w-full rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-amber-400 disabled:opacity-60">
          Activer les notifications sur cet appareil
        </button>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={test} disabled={busy} className="flex-1 rounded-lg bg-gray-700 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-600 disabled:opacity-60">
            Tester
          </button>
          <button type="button" onClick={disable} disabled={busy} className="flex-1 rounded-lg border border-gray-600 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-700 disabled:opacity-60">
            Désactiver
          </button>
        </div>
      )}
      {message && <p className="text-xs text-gray-300" role="status">{message}</p>}
    </div>
  )
}
