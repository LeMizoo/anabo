
-- ============================================================
-- ANABO Roadtrip
-- Migration 0005 : véhicules globaux et durées des circuits
-- Compatible MariaDB 10.11.19
--
-- Migration additive :
-- - aucune table existante supprimée
-- - aucune donnée existante supprimée
-- - aucune colonne existante modifiée
-- - aucune donnée historique écrasée
--
-- À exécuter dans phpMyAdmin sur la base de production.
-- Effectuer une sauvegarde complète avant exécution.
-- ============================================================

USE `anabomg1_anabo_roadtrip`;


-- ============================================================
-- 1. Catalogue global des véhicules
-- ============================================================

CREATE TABLE IF NOT EXISTS `VehicleType` (
    `id` VARCHAR(30) NOT NULL,
    `code` VARCHAR(120) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `pricePerDay` INTEGER NOT NULL DEFAULT 0,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'EUR',
    `indicativeOnly` BOOLEAN NOT NULL DEFAULT false,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VehicleType_code_key` (`code`),
    INDEX `VehicleType_active_name_idx` (`active`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;


-- ============================================================
-- 2. Durées indicatives par circuit, saison et état des routes
-- ============================================================

CREATE TABLE IF NOT EXISTS `CircuitDuration` (
    `id` VARCHAR(30) NOT NULL,
    `circuitSlug` VARCHAR(191) NOT NULL,
    `season` ENUM('DRY', 'RAINY') NOT NULL,
    `roadCondition` ENUM('GOOD', 'MEDIUM', 'DIFFICULT') NOT NULL,
    `minDays` INTEGER NOT NULL,
    `maxDays` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CircuitDuration_circuitSlug_season_roadCondition_key`
        (`circuitSlug`, `season`, `roadCondition`),
    INDEX `CircuitDuration_circuitSlug_idx` (`circuitSlug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;


-- ============================================================
-- 3. Informations de traitement des demandes de devis
-- ============================================================

ALTER TABLE `QuoteRequest`
    ADD COLUMN IF NOT EXISTS `tripSeason`
        ENUM('DRY', 'RAINY') NULL,
    ADD COLUMN IF NOT EXISTS `roadCondition`
        ENUM('GOOD', 'MEDIUM', 'DIFFICULT') NULL,
    ADD COLUMN IF NOT EXISTS `indicativeMinDays`
        INTEGER NULL,
    ADD COLUMN IF NOT EXISTS `indicativeMaxDays`
        INTEGER NULL,
    ADD COLUMN IF NOT EXISTS `selectedDurationDays`
        INTEGER NULL;


-- ============================================================
-- 4. Vérification après exécution
-- ============================================================

SELECT
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'anabomg1_anabo_roadtrip'
  AND (
      TABLE_NAME IN ('VehicleType', 'CircuitDuration')
      OR (
          TABLE_NAME = 'QuoteRequest'
          AND COLUMN_NAME IN (
              'tripSeason',
              'roadCondition',
              'indicativeMinDays',
              'indicativeMaxDays',
              'selectedDurationDays'
          )
      )
  )
ORDER BY TABLE_NAME, ORDINAL_POSITION;
