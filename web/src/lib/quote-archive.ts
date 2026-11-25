import type { Prisma } from '@/generated/prisma/client'

/**
 * Archivage des demandes de devis.
 * Une demande archivée n'est pas supprimée : elle sort simplement des listes
 * de travail, des compteurs et des alertes. On peut la désarchiver à tout moment.
 */

const DAY = 86_400_000

/** Demandes actives (non archivées). */
export const NOT_ARCHIVED = { archivedAt: null } satisfies Prisma.QuoteRequestWhereInput

export type ArchiveRule = 'perdu' | 'termine' | 'sans-suite'

export const ARCHIVE_RULES: { value: ArchiveRule; label: string; help: string }[] = [
  {
    value: 'perdu',
    label: 'Demandes perdues',
    help: 'Toutes les demandes au statut « Perdu ».',
  },
  {
    value: 'termine',
    label: 'Voyages terminés',
    help: 'Voyages confirmés dont la date de retour est passée depuis plus de 7 jours.',
  },
  {
    value: 'sans-suite',
    label: 'Demandes sans suite',
    help: 'Nouveau, contacté ou devis envoyé, dont la date de départ est passée (ou sans date depuis plus de 60 jours).',
  },
]

export function isArchiveRule(value: unknown): value is ArchiveRule {
  return ARCHIVE_RULES.some((rule) => rule.value === value)
}

/** Critères d'une règle, appliqués uniquement aux demandes encore actives. */
export function archiveRuleWhere(rule: ArchiveRule, now = new Date()): Prisma.QuoteRequestWhereInput {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (rule === 'perdu') return { ...NOT_ARCHIVED, status: 'PERDU' }
  if (rule === 'termine') {
    const limit = new Date(today.getTime() - 7 * DAY)
    return {
      ...NOT_ARCHIVED,
      status: 'CONFIRME',
      OR: [
        { acceptedEndDate: { lt: limit } },
        { acceptedEndDate: null, endDate: { lt: limit } },
        { acceptedEndDate: null, endDate: null, startDate: { lt: limit } },
      ],
    }
  }
  return {
    ...NOT_ARCHIVED,
    status: { in: ['NOUVEAU', 'CONTACTE', 'DEVIS_ENVOYE'] },
    OR: [{ startDate: { lt: today } }, { startDate: null, createdAt: { lt: new Date(now.getTime() - 60 * DAY) } }],
  }
}
