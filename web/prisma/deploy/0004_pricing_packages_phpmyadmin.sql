-- Migration Prisma: 0004_pricing_packages
-- MySQL / MariaDB. Requiert 0003_quote_estimate appliquee.
-- Sauvegarder la base et verifier que cette migration n'a pas deja ete appliquee.
-- Les modes restent independants. Les tarifs historiques basePrice sont conserves, jamais utilises en repli.
-- DDL non transactionnel: ne pas relancer integralement apres une erreur partielle.
ALTER TABLE `PricingConfig`
  ADD COLUMN `dailyCarEnabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `tourPriceEnabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `tourPrice` INTEGER NULL;

ALTER TABLE `QuoteRequest`
  ADD COLUMN `pricingMode` ENUM('DAILY_CAR', 'TOUR_INCLUDED') NULL,
  ADD COLUMN `pricingPackageId` VARCHAR(30) NULL,
  ADD COLUMN `pricingPackageName` VARCHAR(120) NULL;

CREATE TABLE `PricingPackage` (
  `id` VARCHAR(30) NOT NULL,
  `configId` VARCHAR(30) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `scope` ENUM('DAILY_CAR', 'TOUR_INCLUDED', 'BOTH') NOT NULL DEFAULT 'BOTH',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `PricingPackage_configId_name_key` (`configId`, `name`),
  INDEX `PricingPackage_configId_idx` (`configId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `PricingPackage_configId_fkey` FOREIGN KEY (`configId`) REFERENCES `PricingConfig` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PricingPackageItem` (
  `id` VARCHAR(30) NOT NULL,
  `packageId` VARCHAR(30) NOT NULL,
  `code` VARCHAR(40) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `unit` ENUM('PER_PERSON', 'PER_DAY', 'PER_VEHICLE', 'FIXED') NOT NULL DEFAULT 'FIXED',
  `price` INTEGER NOT NULL DEFAULT 0,
  UNIQUE INDEX `PricingPackageItem_packageId_code_key` (`packageId`, `code`),
  INDEX `PricingPackageItem_packageId_idx` (`packageId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `PricingPackageItem_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `PricingPackage` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
