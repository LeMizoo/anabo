-- AlterTable
ALTER TABLE `AdminUser` MODIFY `role` ENUM('ADMIN', 'SUPER_ADMIN', 'CHAUFFEUR') NOT NULL DEFAULT 'ADMIN',
    ADD COLUMN `driverId` VARCHAR(30) NULL;

-- AlterTable
ALTER TABLE `QuoteRequest` ADD COLUMN `balancePaidAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `AdminUser_driverId_idx` ON `AdminUser`(`driverId`);
