
'use server'

type PublicCircuitDuration = {
  circuitSlug: string
  season: 'DRY' | 'RAINY'
  roadCondition: 'GOOD' | 'MEDIUM' | 'DIFFICULT'
  minDays: number
  maxDays: number
}

export async function getPublicCircuitDurations(
  circuitSlugs: string[],
): Promise<PublicCircuitDuration[]> {
  if (!Array.isArray(circuitSlugs) || circuitSlugs.length > 30) {
    throw new Error('Liste de circuits invalide.')
  }

  const normalizedSlugs = Array.from(
    new Set(
      circuitSlugs.map((slug) => {
        if (typeof slug !== 'string') {
          throw new Error('Circuit invalide.')
        }

        const normalized = slug.trim().toLowerCase()

        if (!/^[a-z0-9-]{1,191}$/.test(normalized)) {
          throw new Error('Circuit invalide.')
        }

        return normalized
      }),
    ),
  )

  if (normalizedSlugs.length === 0) return []

  const { prisma } = await import('@/lib/prisma')

  return prisma.circuitDuration.findMany({
    where: {
      circuitSlug: { in: normalizedSlugs },
    },
    select: {
      circuitSlug: true,
      season: true,
      roadCondition: true,
      minDays: true,
      maxDays: true,
    },
    orderBy: [
      { circuitSlug: 'asc' },
      { season: 'asc' },
      { roadCondition: 'asc' },
    ],
  })
}
