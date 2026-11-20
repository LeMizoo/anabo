import type { Metadata } from 'next'
import { fontVariables } from '@/lib/fonts'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={fontVariables}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
