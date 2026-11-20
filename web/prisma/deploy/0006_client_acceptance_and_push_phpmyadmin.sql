-- ============================================================
-- ANABO Roadtrip
-- Migration 0006 : traçabilité de l'acceptation client
--                  + abonnements aux notifications push admin
-- Compatible MariaDB 10.11
--
-- Migration additive :
-- - aucune table existante supprimée
-- - aucune donnée existante supprimée ni modifiée
-- - 3 colonnes facultatives ajoutées à QuoteRequest
-- - 1 nouvelle table AdminPushSubscription
-- Le script peut être relancé sans risque (IF NOT EXISTS).
--
-- À exécuter dans phpMyAdmin sur la base de production.
-- Effectuer une sauvegarde complète avant exécution.
-- ============================================================

USE `anabomg1_anabo_roadtrip`;

-- 1. Date et heure exactes de l'acceptation du devis par le client,
--    et dates de voyage acceptées (référence du délai d'annulation de 15 jours).
ALTER TABLE `QuoteRequest`
    ADD COLUMN IF NOT EXISTS `clientAcceptedAt` DATETIME(3) NULL,
    ADD COLUMN IF NOT EXISTS `acceptedStartDate` DATETIME(3) NULL,
    ADD COLUMN IF NOT EXISTS `acceptedEndDate` DATETIME(3) NULL;

-- 2. Abonnements aux notifications push des administrateurs.
CREATE TABLE IF NOT EXISTS `AdminPushSubscription` (
    `id` VARCHAR(30) NOT NULL,
    `adminUserId` VARCHAR(30) NOT NULL,
    `endpointHash` VARCHAR(64) NOT NULL,
    `endpoint` TEXT NOT NULL,
    `p256dh` VARCHAR(255) NOT NULL,
    `auth` VARCHAR(255) NOT NULL,
    `userAgent` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastUsedAt` DATETIME(3) NULL,
    UNIQUE INDEX `AdminPushSubscription_endpointHash_key`(`endpointHash`),
    INDEX `AdminPushSubscription_adminUserId_idx`(`adminUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Vérification
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'anabomg1_anabo_roadtrip'
  AND (
      TABLE_NAME = 'AdminPushSubscription'
      OR (TABLE_NAME = 'QuoteRequest' AND COLUMN_NAME IN ('clientAcceptedAt', 'acceptedStartDate', 'acceptedEndDate'))
  )
ORDER BY TABLE_NAME, ORDINAL_POSITION;
