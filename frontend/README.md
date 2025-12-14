# Frontend - Medical QCM Platform

Application Next.js pour la plateforme de révision QCM médicale.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer les variables d'environnement
```

### Démarrage

```bash
# Mode développement
npm run dev

# Build production
npm run build
npm run start
```

L'application sera disponible sur `http://localhost:3001`

## 📁 Structure

```
app/                      # App Router (Next.js 14+)
├── (auth)/              # Routes d'authentification
├── (dashboard)/         # Routes étudiant
└── (admin)/             # Routes admin

components/               # Composants réutilisables
├── ui/                  # Composants UI (shadcn/ui)
└── features/            # Composants métier

lib/                     # Utilitaires
├── api/                 # Clients API
├── hooks/               # Custom hooks
└── utils/               # Fonctions utilitaires

types/                   # Types TypeScript
```

## 🛠️ Technologies

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)
- React Hook Form + Zod
- shadcn/ui

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E (Playwright)
npm run test:e2e
```
