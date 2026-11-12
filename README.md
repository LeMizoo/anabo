# ANABO Roadtrip Madagascar

Site web multilingue (FR/EN/IT) consacré aux circuits et roadtrips à Madagascar. Il met en avant l'expertise d'un chauffeur-guide local, présente des itinéraires et permet aux visiteurs de demander des devis personnalisés.

## État du projet

La migration vers Sanity v4 et `next-sanity` 11 est terminée. Le site est stable, sécurisé et à jour ; cette migration n'a entraîné aucune régression visuelle. Le build de production ainsi que les vérifications strictes de lint et de TypeScript passent. Les contrôles lint et TypeScript sont exécutés séparément du build.

## Stack technique

- **Application web** : Next.js 15 (App Router), React 18, TypeScript et Tailwind CSS.
- **CMS** : Sanity Studio v4 avec `next-sanity` 11.
- **Base de données** : MySQL/MariaDB avec Prisma, notamment pour les demandes de devis et l'administration.
- **Hébergement** : Simafri (cPanel / Passenger).
- **Gestion du dépôt** : monorepo npm avec workspaces `web` et `studio`.

## Structure du projet

- `web/` : application Next.js.
- `studio/` : Sanity Studio, ses schémas et sa configuration.
- `docs/` : documentation et décisions techniques.

## Prérequis

- Node.js 20 ou plus récent.
- npm 10 ou plus récent.

## Installation et démarrage

Cloner le dépôt et installer les dépendances :

```bash
git clone https://github.com/LeMizoo/anabo.git
cd anabo
npm run install:all
```

Lancer l'application web et le Studio dans deux terminaux distincts :

```bash
npm run dev:web
```

```bash
npm run dev:studio
```

## Build et vérifications

Construire l'application web pour la production et le Studio :

```bash
npm run build:web
npm run build:studio
```

Les contrôles lint et TypeScript de l'application web sont disponibles séparément :

```bash
cd web
npm run lint
npm run type-check
```
