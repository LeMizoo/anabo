-- AlterTable
ALTER TABLE `QuoteRequest` ADD COLUMN `vehicleAmount` INTEGER NULL,
    ADD COLUMN `driverAmount` INTEGER NULL,
    ADD COLUMN `otherAmount` INTEGER NULL,
    ADD COLUMN `driverPaidAt` DATETIME(3) NULL;
