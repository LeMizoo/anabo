'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react' // Assure-toi d'avoir lucide-react

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Évite les erreurs d'hydratation (le serveur ne connaît pas le thème du client)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-9 w-9" /> // Placeholder de la même taille
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
      <button
        onClick={() => setTheme('light')}
        className={`rounded-full p-1.5 transition-colors ${
          theme === 'light' ? 'bg-gray-100 text-[#06245F]' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
        }`}
        title="Mode clair"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`rounded-full p-1.5 transition-colors ${
          theme === 'dark' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
        }`}
        title="Mode sombre"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`rounded-full p-1.5 transition-colors ${
          theme === 'system' ? 'bg-gray-100 text-[#06245F] dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
        }`}
        title="Système"
      >
        <Monitor size={16} />
      </button>
    </div>
  )
}