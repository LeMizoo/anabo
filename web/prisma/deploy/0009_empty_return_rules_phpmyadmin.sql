-- ============================================================
-- ANABO Roadtrip — Migration 0009 : retours à vide paramétrables
-- Compatible MariaDB 10.11 — migration additive, relançable sans risque.
-- Crée la table et la remplit avec les règles actuelles (INSERT IGNORE :
-- ne remplace jamais une règle déjà modifiée dans l'admin).
-- Effectuer une sauvegarde avant exécution.
-- ============================================================

CREATE TABLE IF NOT EXISTS `anabomg1_anabo_roadtrip`.`EmptyReturnRule` (
  `id` VARCHAR(30) NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `days` INTEGER NOT NULL,
  `ferryDays` INTEGER NULL,
  `circuitSlugs` TEXT NOT NULL,
  `regionValues` TEXT NOT NULL,
  `keywords` TEXT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `EmptyReturnRule_active_sortOrder_idx`(`active`, `sortOrder`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO `anabomg1_anabo_roadtrip`.`EmptyReturnRule`
  (`id`, `label`, `days`, `ferryDays`, `circuitSlugs`, `regionValues`, `keywords`, `active`, `sortOrder`, `updatedAt`)
VALUES
  ('er-sud', 'Sud – RN7 (Tuléar, Ifaty, Anakao)', 3, NULL,
   'sud-et-rn7,circuit-safari-en-voiture,birding-tour',
   'sud,south,rn7,madagascar-sud-et-rn7,circuit-sud-rn7',
   'sud et rn7,madagascar sud et rn7,circuit sud rn7,circuit nature et faune,wildlife tour,tour naturalistico e fauna,birding tour,observation des oiseaux,birdwatching in madagascar',
   true, 1, NOW(3)),
  ('er-morondava', 'Morondava', 2, NULL,
   'baobab-et-tsingy',
   'ouest,west,ovest,morondava,baobab-tsingy',
   'baobab et tsingy,morondava',
   true, 2, NOW(3)),
  ('er-diego', 'Diego-Suarez (Antsiranana)', 3, 5,
   'circuit-nord-et-nosibe',
   'nord,north,nord-de-madagascar-et-nosy-be,diego-suarez,nosy-be,nosibe',
   'circuit nord et nosibe,nord de madagascar et nosy be,diego suarez,nosy be',
   true, 3, NOW(3)),
  ('er-toamasina', 'Toamasina (Tamatave)', 2, NULL,
   'cote-est-et-lemuriens',
   'est,east,cotes-est-et-lemuriens,tamatave,toamasina',
   'cote est et lemuriens,cotes est et lemuriens,tamatave,toamasina',
   true, 4, NOW(3));

SELECT `label`, `days`, `ferryDays`, `circuitSlugs`, `regionValues` FROM `anabomg1_anabo_roadtrip`.`EmptyReturnRule` ORDER BY `sortOrder`;
