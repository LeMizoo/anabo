-- ============================================================
-- ANABO Roadtrip — Migration 0010 : rôle Chauffeur et comptabilité
--   * rôle CHAUFFEUR pour les comptes de l'administration
--   * lien entre un compte et une fiche chauffeur (driverId)
--   * date d'encaissement du solde d'un voyage (balancePaidAt)
-- Compatible MariaDB 10.11 — migration additive, relançable sans risque.
-- Tables préfixées par le nom de la base : fonctionne quelle que soit
-- la base sélectionnée dans phpMyAdmin.
-- Effectuer une sauvegarde avant exécution.
-- À exécuter AVANT de déployer l'archive du site.
-- ============================================================

ALTER TABLE `anabomg1_anabo_roadtrip`.`AdminUser` MODIFY `role` ENUM('ADMIN', 'SUPER_ADMIN', 'CHAUFFEUR') NOT NULL DEFAULT 'ADMIN';

ALTER TABLE `anabomg1_anabo_roadtrip`.`AdminUser` ADD COLUMN IF NOT EXISTS `driverId` VARCHAR(30) NULL;

CREATE INDEX IF NOT EXISTS `AdminUser_driverId_idx` ON `anabomg1_anabo_roadtrip`.`AdminUser` (`driverId`);

ALTER TABLE `anabomg1_anabo_roadtrip`.`QuoteRequest` ADD COLUMN IF NOT EXISTS `balancePaidAt` DATETIME(3) NULL;

SELECT `role`, COUNT(*) AS comptes FROM `anabomg1_anabo_roadtrip`.`AdminUser` GROUP BY `role`;
