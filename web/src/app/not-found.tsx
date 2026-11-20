import Link from 'next/link'
import { fontVariables } from '@/lib/fonts'

// 404 hors locale (ex. /admin/inexistant) : le layout racine ne rend pas <html>.
export default function GlobalNotFound() {
  return (
    <html lang="fr" className={fontVariables}>
      <body className="font-sans antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#06245F] px-4 text-center text-white">
          <p className="text-6xl font-bold">404</p>
          <h1 className="text-xl font-semibold">Page introuvable</h1>
          <Link href="/" className="underline underline-offset-4">
            Retour à l’accueil
          </Link>
        </main>
      </body>
    </html>
  )
}
