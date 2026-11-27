-- ============================================================
-- ANABO Roadtrip — Migration 0011 : ventilation comptable des voyages
--   * vehicleAmount : part « location véhicule » du montant total
--   * driverAmount  : part « indemnité chauffeur »
--   * otherAmount   : autres frais (bac, extras…)
--   * driverPaidAt  : date à laquelle l'indemnité a été reversée au chauffeur
-- Compatible MariaDB 10.11 — migration additive, relançable sans risque.
-- Effectuer une sauvegarde avant exécution.
-- À exécuter AVANT de déployer l'archive du site.
-- ============================================================

ALTER TABLE `anabomg1_anabo_roadtrip`.`QuoteRequest`
  ADD COLUMN IF NOT EXISTS `vehicleAmount` INT NULL,
  ADD COLUMN IF NOT EXISTS `driverAmount` INT NULL,
  ADD COLUMN IF NOT EXISTS `otherAmount` INT NULL,
  ADD COLUMN IF NOT EXISTS `driverPaidAt` DATETIME(3) NULL;

SELECT COUNT(*) AS voyages_confirmes, SUM(`quoteTotalAmount` IS NOT NULL) AS avec_montant FROM `anabomg1_anabo_roadtrip`.`QuoteRequest` WHERE `status` = 'CONFIRME';
