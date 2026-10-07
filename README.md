# ANABO ROADTRIP MADAGASCAR — Application Web

Application web moderne pour ANABO ROADTRIP MADAGASCAR.

## Architecture

- Frontend : Next.js 15 + React 18 + TypeScript + Tailwind CSS
- CMS : Sanity Studio 3
- Multilingue : next-intl (FR / EN)
- Formulaires : React Hook Form + Zod + Resend
- Hébergement : SIMAFRI (cPanel Apache)

## Structure

anabo-roadtrip/
├── web/       # Application Next.js
├── studio/    # Sanity Studio (CMS)
└── docs/      # Documentation

## Démarrage rapide

### Installation

npm run install:all

### Développement

Terminal 1 - Frontend :
npm run dev:web
Ouvrir http://localhost:3000

Terminal 2 - CMS :
npm run dev:studio
Ouvrir http://localhost:3333

### Build

npm run build:web
npm run deploy:studio

## Contacts

- Client : Vonjy Harilanto — drivergiide.mada@gmail.com
- Développeur : Tovoniaina RAHENDRISON — tovoniaina.rahendrison@gmail.com

© 2026 ANABO ROADTRIP MADAGASCAR
