# Transfert de `0004_pricing_packages` vers Simafri

Cette migration permet d'activer indépendamment la location journalière et le prix global du circuit avec véhicule inclus. Un même circuit peut proposer les deux. Elle ajoute aussi les packages par circuit, leurs prestations tarifées et leur portée (Daily, Tour ou les deux). Les demandes mémorisent le mode et le package choisis.

Fichier phpMyAdmin : `0004_pricing_packages_phpmyadmin.sql`.

Prérequis : la base doit déjà contenir les changements de `0003_quote_estimate`, et les deux tables `PricingConfig` et `PricingVehicle` doivent exister. Faire un export complet avant l'import. Vérifier dans `_prisma_migrations` que `0004_pricing_packages` n'est pas déjà appliquée et que `dailyCarEnabled`, `tourPriceEnabled`, `tourPrice`, `PricingPackage` et `PricingPackageItem` ne sont pas déjà présents. Le SQL n'est pas idempotent.

Après exécution manuelle réussie dans phpMyAdmin, marquer la migration comme appliquée avec `prisma migrate resolve --applied 0004_pricing_packages` depuis un environnement relié à la base de production, puis contrôler `prisma migrate status`. Ne pas relancer le SQL après résolution. Cette préparation locale n'a apporté aucune modification à la base de production.

Le tarif historique `basePrice` est conservé en base pour ne pas perdre les données existantes, mais le nouveau calcul ne l'utilise jamais comme repli. Les deux modes sont désactivés par défaut pour toutes les configurations après migration. Il faut activer explicitement chaque mode et saisir son tarif dans `/admin/prix`; tant qu'un mode n'est pas correctement configuré, le calculateur ne renvoie aucune estimation pour ce mode.
