-- ============================================================
-- ANABO Roadtrip
-- Migration 0006 : traçabilité de l'acceptation client
--                  + abonnements aux notifications push admin
--                  + gestion des chauffeurs
-- Compatible MariaDB 10.11
--
-- Migration additive :
-- - aucune table existante supprimée
-- - aucune donnée existante supprimée ni modifiée
-- - 4 colonnes facultatives ajoutées à QuoteRequest
-- - 2 nouvelles tables : AdminPushSubscription, Driver
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
    ADD COLUMN IF NOT EXISTS `acceptedEndDate` DATETIME(3) NULL,
    ADD COLUMN IF NOT EXISTS `assignedDriverId` VARCHAR(30) NULL;

CREATE INDEX IF NOT EXISTS `QuoteRequest_assignedDriverId_idx` ON `QuoteRequest`(`assignedDriverId`);

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

-- 3. Chauffeurs (équipe permanente et renforts temporaires).
CREATE TABLE IF NOT EXISTS `Driver` (
    `id` VARCHAR(30) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(40) NULL,
    `email` VARCHAR(191) NULL,
    `languages` VARCHAR(191) NULL,
    `licenseNumber` VARCHAR(80) NULL,
    `vehicleLabel` VARCHAR(150) NULL,
    `vehicleSeats` INTEGER NULL,
    `isTemporary` BOOLEAN NOT NULL DEFAULT false,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `Driver_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Vérification
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'anabomg1_anabo_roadtrip'
  AND (
      TABLE_NAME IN ('AdminPushSubscription', 'Driver')
      OR (TABLE_NAME = 'QuoteRequest' AND COLUMN_NAME IN ('clientAcceptedAt', 'acceptedStartDate', 'acceptedEndDate', 'assignedDriverId'))
  )
ORDER BY TABLE_NAME, ORDINAL_POSITION;
