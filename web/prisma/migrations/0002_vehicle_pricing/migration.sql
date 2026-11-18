-- AlterTable
-- Estimation tarifaire par véhicule : prix = totalDays x dailyRate (pas de prix par personne).
ALTER TABLE `QuoteRequest`
    ADD COLUMN `vehicleType` VARCHAR(20) NULL,
    ADD COLUMN `totalDays` INTEGER NULL,
    ADD COLUMN `dailyRate` INTEGER NULL,
    ADD COLUMN `estimatedPrice` INTEGER NULL;
