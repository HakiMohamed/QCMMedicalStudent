# Backend - Medical QCM Platform

API NestJS pour la plateforme de révision QCM médicale.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL 15+ (ou Docker)
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement dans .env
```

### Base de Données

```bash
# Démarrer PostgreSQL avec Docker
docker-compose up -d postgres

# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations
npm run prisma:migrate

# (Optionnel) Ouvrir Prisma Studio
npm run prisma:studio
```

### Démarrage

```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'API sera disponible sur `http://localhost:3000`
La documentation Swagger sera disponible sur `http://localhost:3000/api/docs`

## 📁 Structure

```
src/
├── main.ts                 # Point d'entrée
├── app.module.ts          # Module racine
├── prisma/                # Service Prisma
├── auth/                  # Authentification
├── users/                 # Gestion utilisateurs
├── academic/             # Structure académique
├── questions/            # Gestion QCM
├── progress/             # Suivi progression
├── admin/                # Backoffice
└── common/               # Code partagé
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov

# Tests E2E
npm run test:e2e
```

## 📚 Documentation

- [Documentation API](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)

