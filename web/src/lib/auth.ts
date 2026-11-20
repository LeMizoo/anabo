import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authConfig } from './auth.config'

// Protection contre les essais de mots de passe en série :
// 5 échecs en 15 minutes pour un même e-mail bloquent ce compte 15 minutes.
const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60 * 1000
const failures = new Map<string, { count: number; first: number }>()

function isLocked(email: string) {
  const entry = failures.get(email)
  if (!entry) return false
  if (Date.now() - entry.first > WINDOW_MS) {
    failures.delete(email)
    return false
  }
  return entry.count >= MAX_FAILURES
}

function recordFailure(email: string) {
  const entry = failures.get(email)
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    failures.set(email, { count: 1, first: Date.now() })
  } else {
    entry.count++
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = String(credentials.email).trim().toLowerCase().slice(0, 191)

        if (isLocked(email)) {
          console.warn('[auth] Connexion temporairement bloquée pour', email)
          return null
        }

        const user = await prisma.adminUser.findUnique({
          where: { email },
        })

        if (!user || !user.active) {
          recordFailure(email)
          return null
        }

        const isValid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        )

        if (!isValid) {
          recordFailure(email)
          return null
        }

        failures.delete(email)

        await prisma.adminUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
})