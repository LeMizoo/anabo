-- CreateTable
-- Véhicules et tarifs journaliers (euros), modifiables dans /admin/prix.
CREATE TABLE `Vehicle` (
    `id` VARCHAR(30) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `modelName` VARCHAR(100) NOT NULL DEFAULT '',
    `seats` INTEGER NOT NULL,
    `dailyRate` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Reprise des tarifs déjà saisis (migration 0003). Le nombre de places est une valeur
-- de départ à vérifier dans /admin/prix.
INSERT INTO `Vehicle` (`id`, `name`, `modelName`, `seats`, `dailyRate`, `sortOrder`, `active`, `createdAt`, `updatedAt`)
SELECT
    CONCAT('veh_', `vehicleType`),
    CASE `vehicleType` WHEN 'minivan' THEN 'Mini van' ELSE `vehicleType` END,
    `modelName`,
    CASE `vehicleType` WHEN 'minivan' THEN 8 ELSE 4 END,
    `dailyRate`,
    CASE `vehicleType` WHEN '4x4' THEN 0 ELSE 1 END,
    true,
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
FROM `VehicleRate`;

-- DropTable
DROP TABLE `VehicleRate`;

-- CreateTable
-- Durée des circuits par saison (fourchette min-max de jours).
-- circuitKey = translationGroup du circuit dans Sanity.
CREATE TABLE `CircuitDuration` (
    `circuitKey` VARCHAR(191) NOT NULL,
    `dryMin` INTEGER NULL,
    `dryMax` INTEGER NULL,
    `rainyMin` INTEGER NULL,
    `rainyMax` INTEGER NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`circuitKey`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
-- Les colonnes d'estimation de la migration 0002 sont remplacées par des fourchettes
-- (durée selon la saison) et par le véhicule choisi dans la liste dynamique.
ALTER TABLE `QuoteRequest`
    DROP COLUMN `vehicleType`,
    DROP COLUMN `totalDays`,
    DROP COLUMN `estimatedPrice`,
    ADD COLUMN `vehicleId` VARCHAR(30) NULL,
    ADD COLUMN `vehicleName` VARCHAR(100) NULL,
    ADD COLUMN `season` VARCHAR(10) NULL,
    ADD COLUMN `daysMin` INTEGER NULL,
    ADD COLUMN `daysMax` INTEGER NULL,
    ADD COLUMN `priceMin` INTEGER NULL,
    ADD COLUMN `priceMax` INTEGER NULL;
