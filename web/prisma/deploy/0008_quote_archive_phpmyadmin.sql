-- ============================================================
-- ANABO Roadtrip — Migration 0008 : archivage des demandes de devis
-- Compatible MariaDB 10.11 — migration additive, relançable sans risque.
-- Tables préfixées par le nom de la base : fonctionne quelle que soit
-- la base sélectionnée dans phpMyAdmin.
-- Effectuer une sauvegarde avant exécution.
-- À exécuter AVANT de déployer l'archive du site.
-- ============================================================

ALTER TABLE `anabomg1_anabo_roadtrip`.`QuoteRequest` ADD COLUMN IF NOT EXISTS `archivedAt` DATETIME(3) NULL, ADD COLUMN IF NOT EXISTS `archivedBy` VARCHAR(191) NULL;

CREATE INDEX IF NOT EXISTS `QuoteRequest_archivedAt_idx` ON `anabomg1_anabo_roadtrip`.`QuoteRequest` (`archivedAt`);

SELECT COUNT(*) AS demandes, SUM(`archivedAt` IS NOT NULL) AS archivees FROM `anabomg1_anabo_roadtrip`.`QuoteRequest`;
