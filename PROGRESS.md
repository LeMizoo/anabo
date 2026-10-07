📋 RÉSUMÉ DU PROJET ANABO ROADTRIP
Date du résumé : 7 octobre 2026
Projet : Refonte du site anabo.mg (WordPress → Next.js + Sanity)

🎯 OBJECTIF DU PROJET
Migrer le site WordPress anabo.mg (agence de circuits privés à Madagascar) vers une stack moderne :

Frontend : Next.js 15 + React 18 + TypeScript + Tailwind CSS

CMS : Sanity Studio 3

Multilingue : next-intl (FR / EN)

Formulaires : React Hook Form + Zod + Resend

Hébergement : SIMAFRI (cPanel Apache)

Structure du projet :

text
/d/Vonjy/anabomg/
├── web/       ← Application Next.js
├── studio/    ← Sanity Studio (CMS)
└── docs/      ← Documentation
✅ CE QUI EST FAIT
1. Environnement
Windows + VS Code + Git Bash ✅

Node.js installé ✅

npm fonctionnel ✅

Git fonctionnel ✅

2. Structure du projet créée
Racine (/d/Vonjy/anabomg/) :

package.json (scripts orchestrés)

README.md (documentation projet)

.gitignore

.nvmrc

Web (web/) — Next.js 15.5.27 :

package.json (toutes les dépendances installées)

tsconfig.json, next.config.js

tailwind.config.ts, postcss.config.js

.env.example, .env.local ✅ (avec Project ID Sanity)

middleware.ts (i18n FR/EN)

src/app/layout.tsx (racine)

src/app/globals.css

src/app/[locale]/layout.tsx

src/app/[locale]/page.tsx (placeholder)

src/lib/i18n.ts, src/lib/sanity.ts, src/lib/utils.ts

src/messages/fr.json, src/messages/en.json

Studio (studio/) — Sanity Studio 3.99 :

package.json (dépendances installées)

tsconfig.json, sanity.cli.ts, sanity.config.ts

.env.example, .env.local ✅ (avec Project ID Sanity)

schemas/schema.ts

schemas/documents/ : page.ts, siteSettings.ts, testimonial.ts

schemas/objects/seoFields.ts

schemas/objects/blocks/ : 8 blocs (heroBlock, textMediaBlock, galleryBlock, testimonialBlock, tripadvisorBlock, ctaBlock, faqBlock, contactFormBlock)

3. Sanity configuré
Compte Sanity créé ✅

Projet Sanity : ANABO ROADTRIP (Project ID : 74mwtn03)

Dataset : production

Token API : créé (rôle Viewer) et placé dans web/.env.local

Studio Sanity : ✅ fonctionne sur http://localhost:3333

4. Web Next.js
Serveur Next.js : ✅ fonctionne sur http://localhost:3000

Mais : ❌ 404 sur la page d'accueil (problème en cours de diagnostic)

5. Contenu collecté depuis l'ancien site
Élément	Statut
Home	✅ texte complet
Madagascar	✅ texte complet
Tour Ideas	✅ texte complet
Trip Guidelines	✅ texte complet
About Us ("I am Vonjy")	✅ texte complet
Contact	✅ texte complet
Menu principal	✅ (5 items)
Footer	✅ (complet)
Coordonnées entreprise	✅ (tél, email, adresse)
FAQ	⬜ à collecter
Gallery	⬜ à collecter
9 circuits (pages dédiées)	⬜ à collecter
Pages WooCommerce	⬜ à collecter
Images (URLs)	⚠️ répertoire uploads/ confirmé
⏳ PROBLÈME EN COURS
🐛 Le 404 sur la page d'accueil
Symptôme :

http://localhost:3000/ retourne 404

http://localhost:3000/fr : à tester

http://localhost:3000/en : à tester

Cause probable :
Le plugin next-intl cherche par défaut le fichier de config à un endroit précis. Depuis next-intl v3.25+, la convention a changé :

Avant : createNextIntlPlugin('./src/lib/i18n.ts')

Maintenant : createNextIntlPlugin('./src/i18n/request.ts')

Solution pressentie :

Créer web/src/i18n/request.ts

Modifier web/next.config.js pour pointer vers ce nouveau fichier

À vérifier avant de corriger :

web/middleware.ts

find src/app -type f (liste des routes)

web/src/lib/i18n.ts + web/next.config.js

🎯 CE QUI RESTE À FAIRE (par ordre de priorité)
Phase 1 — Débloquer le développement (aujourd'hui)
Corriger le 404 de la page d'accueil

Vérifier que /fr et /en fonctionnent

Créer du contenu test dans Sanity (1 page + 1 témoignage)

Connecter Next.js à Sanity (queries + affichage)

Phase 2 — Composants UI
Créer Header (avec le menu réel)

Créer Footer (avec le footer réel)

Créer Button, Card, Section, Container, SectionTitle

Créer les composants Home : HomeHero, VonjyIntro, ThemesGrid, CarPricing, SuggestedTours, Services, WhyServices, GalleryStrip, FinalCta

Phase 3 — Pages
Page Home complète avec le vrai contenu

Page Madagascar

Page Tour Ideas (avec les 9 circuits en cartes)

Page Trip Guidelines

Page About Us

Page Contact (avec formulaire fonctionnel)

Page FAQ (une fois collectée)

Page Gallery (une fois collectée)

9 pages circuits (une fois collectées)

Phase 4 — Multilingue & SEO
Traduire en FR et EN

Configurer le SEO (meta, Open Graph, sitemap)

Configurer le blog éventuel

Phase 5 — Déploiement
Build de production

Déploiement sur SIMAFRI (cPanel Apache)

Configuration domaine anabo.mg

Tests finaux

Phase 6 — Bonus
Formulaire de contact via Resend (email)

Intégration TripAdvisor (avis)

Galerie photos optimisée (next/image)

Analytics (Plausible ou GA4)

📁 INFORMATIONS CLÉS À RETENIR
Identifiants Sanity
Project ID : 74mwtn03

Dataset : production

Organization ID : oz1nlvpsv

Studio local : http://localhost:3333

Dashboard Sanity : https://sanity.io/manage/project/74mwtn03

Coordonnées entreprise (ancien site)
Tél : +261 32 99 298 60

Email : mytrip.mada@gmail.com

Adresse : Itaosy, Antananarivo, Madagasikara

WhatsApp : à confirmer

Réseaux : Facebook, Twitter, Instagram, WhatsApp

Personnes
Client : Vonjy Harilanto — drivergiide.mada@gmail.com

Développeur : Tovoniaina RAHENDRISON — tovoniaina.rahendrison@gmail.com

URLs locales
Web Next.js : http://localhost:3000

Studio Sanity : http://localhost:3333

Fichiers sensibles (à ne pas partager)
web/.env.local (contient le token Sanity)

studio/.env.local (contient le Project ID)

🚀 REPRISE IMMÉDIATE — CE QU'ON FAIT MAINTENANT
Étape 1 — Vous m'envoyez ces 4 infos :

bash
cd /d/Vonjy/anabomg/web
cat middleware.ts
cat next.config.js
cat src/lib/i18n.ts
find src/app -type f
Étape 2 — Je diagnostique le 404 et vous donne la correction exacte.

Étape 3 — Vous corrigez, on relance, on valide que http://localhost:3000/fr fonctionne.

Étape 4 — On crée du contenu test dans Sanity, on connecte, et on enchaîne.