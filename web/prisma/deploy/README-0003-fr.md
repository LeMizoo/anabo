# Transfert de la migration `0003_quote_estimate` vers Simafri

Fichier SQL à importer dans phpMyAdmin : `0003_quote_estimate_phpmyadmin.sql`.

## Avant l'import

1. Dans phpMyAdmin, sélectionne `anabomg1_anabo_roadtrip` et exporte une sauvegarde complète.
2. Vérifie que `PricingConfig`, `PricingVehicle` et `PricingRule` existent : elles sont créées par `0002_pricing`. Si elles n'existent pas, **ne lance pas le SQL 0003 seul** : il faut d'abord déployer `0002_pricing`.
3. Vérifie que la migration `0003_quote_estimate` n'est pas déjà présente dans `_prisma_migrations`.
4. Vérifie que les nouvelles colonnes (`estimateDetails`, `vehicleCode`, `vehicleLabel`, `vehicleCount`, `consecutiveCircuits`, `code`, `aliases`) et l'index `PricingVehicle_configId_code_key` ne sont pas déjà présents. Le script n'est pas idempotent et doit être exécuté une seule fois.

La requête ci-dessous permet de vérifier la présence des tables et colonnes avant l'import :

```sql
SELECT TABLE_NAME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('PricingConfig', 'PricingVehicle', 'PricingRule');

SELECT TABLE_NAME, COLUMN_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND ((TABLE_NAME = 'QuoteRequest' AND COLUMN_NAME IN ('estimateDetails', 'vehicleCode', 'vehicleLabel', 'vehicleCount', 'consecutiveCircuits'))
    OR (TABLE_NAME = 'PricingVehicle' AND COLUMN_NAME IN ('code', 'aliases')));

SELECT INDEX_NAME
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'PricingVehicle'
  AND INDEX_NAME = 'PricingVehicle_configId_code_key';
```

`0002_pricing` est une condition préalable, même si l'application fonctionne déjà avec les anciennes tables `AdminUser` et `QuoteRequest`.

## Importer

Après sauvegarde et vérification, ouvre `0003_quote_estimate_phpmyadmin.sql` dans l'onglet **SQL** de phpMyAdmin, sélectionne la base de production et exécute le script une fois. Si phpMyAdmin retourne une erreur au milieu, arrête-toi et ne relance pas tout le script : certaines instructions DDL peuvent déjà être appliquées.

## Historique Prisma

L'exécution SQL via phpMyAdmin ne marque pas automatiquement la migration comme appliquée dans Prisma. Après réussite complète du SQL, il faut enregistrer `0003_quote_estimate` comme appliquée avec `prisma migrate resolve --applied 0003_quote_estimate` depuis un environnement configuré pour la base de production, puis vérifier `prisma migrate status`. Ne lance pas cette commande avant que le SQL soit entièrement appliqué. Ne modifie pas directement `_prisma_migrations` à la main.

La commande `resolve` nécessite que le dossier `web/prisma/migrations/0003_quote_estimate/migration.sql` soit disponible, ainsi que le fichier `migration_lock.toml` (`provider = "mysql"`). Garder ces fichiers dans le dépôt pour tous les prochains déploiements.
