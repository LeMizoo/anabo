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
