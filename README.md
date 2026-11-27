# ANABO Roadtrip Madagascar

Site web multilingue (FR / EN / IT) de **roadtrip.anabo.mg** : location de voiture avec chauffeur-guide, circuits et voyages sur mesure à Madagascar. Le site est porté par Vonjy, chauffeur-guide certifié depuis 2017, qui travaille avec une équipe de chauffeurs-guides issus des écoles de tourisme et des tours opérateurs malgaches. Les visiteurs consultent les circuits et demandent un devis avec une estimation immédiate ; l’équipe traite les demandes dans un espace d’administration.

## Fonctionnalités

### Site public (`/fr`, `/en`, `/it`)

- **Accueil, Madagascar, Idées de circuits, Conseils de voyage, À propos, Contact**, gérés dans Sanity.
- **Madagascar** : présentation de l’île (situation, relief, climat, histoire) et galerie de 79 photos légendées (`#photos`). L’ancienne page Galerie redirige ici (308).
- **10 circuits** avec programme jour par jour, itinéraire et galerie légendée ; **voyage sur mesure**.
- **FAQ** (`/faq`) : 30 questions en 6 thèmes, avec données structurées `FAQPage`.
- **Demande de devis** : estimation en direct (véhicule, durée, retours à vide, option Nosy Be), récapitulatif avant envoi, e-mails Resend au client et à l’équipe, suivi client sur `/devis/[référence]`.
- **Conditions d’annulation** (`/annulation`), **politique de cookies**, bandeau de consentement.
- Responsive de 320 px à l’écran large ; heures affichées en heure de Madagascar (GMT+3).

### Administration (`/admin`)

| Page | Rôle |
|---|---|
| Tableau de bord | Chiffres clés, alertes de capacité, dernières demandes |
| Demandes de devis | Liste paginée (10 par page), filtres, archivage manuel ou par règle, fiche détaillée |
| Planning | Voyages confirmés et chevauchements véhicules/chauffeurs (« Mes voyages » pour un chauffeur) |
| Chauffeurs | Équipe et renforts temporaires |
| Prix et véhicules | Onglets **Véhicules**, **Durées des circuits**, **Retours à vide** (super-admin) |
| Comptabilité | Chiffre d’affaires, encaissé, reste à encaisser par mois et par voyage, solde reçu, export CSV (super-admin) |
| Paiement et acompte | Taux d’acompte et instructions de paiement (super-admin) |
| Utilisateurs | Invitation, modification, activation et suppression des comptes, fiche chauffeur liée (super-admin) |
| Mon compte | Profil, mot de passe, notifications push |

### Rôles

| Rôle | Accès |
|---|---|
| Super-administrateur | Tout, y compris Comptabilité, Prix et véhicules, Paiement et acompte, Utilisateurs |
| Administrateur | Tableau de bord, Demandes, Planning, Chauffeurs, Mon compte |
| Chauffeur | « Mes voyages » (ses voyages confirmés, relié à une fiche chauffeur) et Mon compte |

Le contrôle d’accès est centralisé dans `web/src/lib/admin-access.ts` : le compte est relu en base à chaque requête (un changement de rôle ou une désactivation s’applique immédiatement), la mise en page de l’Admin refuse les pages non autorisées et chaque action serveur vérifie le rôle. Un utilisateur ne peut ni supprimer ni rétrograder son propre compte ; le dernier super-administrateur actif ne peut pas être retiré.

## Stack technique

- **Application web** : Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, next-intl.
- **CMS** : Sanity Studio v4 avec `next-sanity` 11.
- **Base de données** : MariaDB avec Prisma 6 (demandes, tarifs, utilisateurs, paramètres).
- **E-mails** : Resend. **Authentification** : Auth.js (sessions JWT).
- **Hébergement** : Simafri (cPanel / Passenger). Studio hébergé par Sanity.
- **Dépôt** : monorepo npm (`web`, `studio`).

## Structure du projet

- `web/` : application Next.js (`src/app`, `src/components`, `src/lib`, `messages/` pour les textes d’interface FR/EN/IT).
- `web/prisma/` : schéma, migrations (`migrations/`) et scripts SQL pour phpMyAdmin (`deploy/`).
- `studio/` : Sanity Studio, schémas et configuration.
- `docs/` : documentation et décisions techniques.

## Prérequis

- Node.js 20 ou plus récent, npm 10 ou plus récent.
- Une base MariaDB/MySQL accessible et un projet Sanity.

## Installation et démarrage

```bash
git clone https://github.com/LeMizoo/anabo.git
cd anabo
npm run install:all
cp web/.env.example web/.env.local   # puis compléter les valeurs
npm run dev:web      # http://localhost:3000
npm run dev:studio   # dans un second terminal
```

### Variables d’environnement (`web/.env.local`)

Ne jamais committer ces fichiers. Variables utilisées :

- Sanity : `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`
- Site : `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_TRIPADVISOR_URL`
- E-mails : `RESEND_API_KEY`, `CONTACT_EMAIL`
- Base et authentification : `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST`
- Notifications push et tâches planifiées : `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`

## Build et vérifications

```bash
cd web
npm run lint
npm run type-check
npm run build
```

## Base de données

Les migrations sont dans `web/prisma/migrations/` (0001 à 0010). En production, la base est modifiée **uniquement** en exécutant dans phpMyAdmin, après sauvegarde, le script correspondant de `web/prisma/deploy/` (tables préfixées `anabomg1_anabo_roadtrip`), **avant** de déployer la version qui l’utilise.

- 0009 (règles de retour à vide paramétrables) : appliquée.
- 0010 (rôle Chauffeur, `AdminUser.driverId`, `QuoteRequest.balancePaidAt`) : à exécuter avant le déploiement de la version « rôle Chauffeur et comptabilité ». Sans elle, la connexion à l’Admin et l’envoi des demandes de devis échouent.

## Déploiement (production)

1. Construire en local : `cd web && npm run build`.
2. Créer l’archive : `tar --exclude='.next/cache' -czf next-build-AAAAMMJJ.tar.gz .next public/admin-sw.js`.
3. L’envoyer dans `~/roadtrip.anabo.mg/` sur le serveur, puis :

```bash
cd ~/roadtrip.anabo.mg
rm -rf .next.old && mv .next .next.old
tar -xzf next-build-AAAAMMJJ.tar.gz
cat .next/BUILD_ID
: > stderr.log && touch tmp/restart.txt && sleep 15 && tail -n 20 stderr.log
```

En cas de problème : `rm -rf .next && mv .next.old .next && touch tmp/restart.txt`.

Le Studio se publie avec `npm run deploy:studio`. Les modifications de contenu Sanity sont visibles sur le site sans redéploiement.

## Référencement

- `sitemap.xml` généré depuis Sanity (60 URL, versions FR/EN/IT liées par `hreflang`) ; les pages redirigées en sont exclues.
- Balises canoniques par page, HTTPS forcé (HSTS), métadonnées rendues côté serveur.
- Après un déploiement important : renvoyer le sitemap dans Google Search Console et demander l’indexation des pages modifiées.

## Conventions de contenu

- **Voix** : c’est toujours Vonjy qui parle (« je », « mon équipe et moi »), jamais « Vonjy et son équipe ».
- Chaque contenu existe en FR, EN et IT ; italien au tutoiement.
- Chaque photo de galerie a une légende, qui sert aussi de texte alternatif.
- Tarifs et règles commerciales : modifiés uniquement dans **Admin > Prix et véhicules**, puis répercutés dans la FAQ si nécessaire.
