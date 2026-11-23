-- AlterTable
ALTER TABLE `QuoteRequest` ADD COLUMN `depositPaidAt` DATETIME(3) NULL,
    ADD COLUMN `quoteCurrency` VARCHAR(3) NULL,
    ADD COLUMN `quoteTotalAmount` INTEGER NULL;

-- CreateTable
CREATE TABLE `PaymentSettings` (
    `id` VARCHAR(30) NOT NULL DEFAULT 'default',
    `method` VARCHAR(80) NOT NULL DEFAULT 'Mobile Money',
    `phoneNumber` VARCHAR(40) NOT NULL DEFAULT '+261 32 99 298 60',
    `accountHolder` VARCHAR(150) NULL,
    `depositPercent` INTEGER NOT NULL DEFAULT 30,
    `instructions` TEXT NULL,
    `updatedBy` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- Ligne de paramètres par défaut
INSERT INTO `PaymentSettings` (`id`, `method`, `phoneNumber`, `depositPercent`, `updatedAt`) VALUES ('default', 'Mobile Money', '+261 32 99 298 60', 30, NOW(3));
