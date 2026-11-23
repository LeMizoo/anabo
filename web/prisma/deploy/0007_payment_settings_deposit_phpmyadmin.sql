-- ============================================================
-- ANABO Roadtrip — Migration 0007 : acompte et paramètres de paiement
-- Compatible MariaDB 10.11 — migration additive, relançable sans risque.
-- Tables préfixées par le nom de la base : fonctionne quelle que soit
-- la base sélectionnée dans phpMyAdmin.
-- Effectuer une sauvegarde avant exécution.
-- ============================================================

ALTER TABLE `anabomg1_anabo_roadtrip`.`QuoteRequest` ADD COLUMN IF NOT EXISTS `quoteTotalAmount` INTEGER NULL, ADD COLUMN IF NOT EXISTS `quoteCurrency` VARCHAR(3) NULL, ADD COLUMN IF NOT EXISTS `depositPaidAt` DATETIME(3) NULL;

CREATE TABLE IF NOT EXISTS `anabomg1_anabo_roadtrip`.`PaymentSettings` (`id` VARCHAR(30) NOT NULL DEFAULT 'default', `method` VARCHAR(80) NOT NULL DEFAULT 'Mobile Money', `phoneNumber` VARCHAR(40) NOT NULL DEFAULT '+261 32 99 298 60', `accountHolder` VARCHAR(150) NULL, `depositPercent` INTEGER NOT NULL DEFAULT 30, `instructions` TEXT NULL, `updatedBy` VARCHAR(191) NULL, `updatedAt` DATETIME(3) NOT NULL, PRIMARY KEY (`id`)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO `anabomg1_anabo_roadtrip`.`PaymentSettings` (`id`, `method`, `phoneNumber`, `depositPercent`, `updatedAt`) VALUES ('default', 'Mobile Money', '+261 32 99 298 60', 30, NOW(3));

SELECT * FROM `anabomg1_anabo_roadtrip`.`PaymentSettings`;
