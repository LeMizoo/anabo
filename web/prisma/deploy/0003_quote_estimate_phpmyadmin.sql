-- Migration Prisma: 0003_quote_estimate
-- Base cible: MySQL / MariaDB
-- IMPORTANT: executer uniquement si 0002_pricing est deja appliquee et si
-- ces colonnes/index n'existent pas encore. Faire une sauvegarde avant.
-- Les DDL MySQL/MariaDB provoquent des commits implicites: pas de rollback
-- fiable via transaction phpMyAdmin.

ALTER TABLE `QuoteRequest`
  ADD COLUMN `estimateDetails` TEXT NULL,
  ADD COLUMN `vehicleCode` VARCHAR(120) NULL,
  ADD COLUMN `vehicleLabel` VARCHAR(120) NULL,
  ADD COLUMN `vehicleCount` INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN `consecutiveCircuits` INTEGER NOT NULL DEFAULT 1;

ALTER TABLE `PricingVehicle`
  ADD COLUMN `code` VARCHAR(120) NOT NULL DEFAULT '',
  ADD COLUMN `aliases` TEXT NULL;

UPDATE `PricingVehicle` SET `code` = `name` WHERE `code` = '';

CREATE UNIQUE INDEX `PricingVehicle_configId_code_key`
  ON `PricingVehicle` (`configId`, `code`);
