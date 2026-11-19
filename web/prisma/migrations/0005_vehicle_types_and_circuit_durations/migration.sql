-- ANABO Roadtrip
-- Migration 0005 : véhicules globaux et durées des circuits
-- Les changements ont déjà été exécutés manuellement en production.

CREATE TABLE `VehicleType` (
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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CircuitDuration` (
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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `QuoteRequest`
    ADD COLUMN `tripSeason` ENUM('DRY', 'RAINY') NULL,
    ADD COLUMN `roadCondition` ENUM('GOOD', 'MEDIUM', 'DIFFICULT') NULL,
    ADD COLUMN `indicativeMinDays` INTEGER NULL,
    ADD COLUMN `indicativeMaxDays` INTEGER NULL,
    ADD COLUMN `selectedDurationDays` INTEGER NULL;
