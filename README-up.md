# Plateforme QCM Médicale

Plateforme moderne de révision QCM pour étudiants en médecine.

## 🚀 Stack Technique

- **Backend**: NestJS 10+ avec TypeScript
- **Frontend**: Next.js 14+ avec App Router
- **Base de données**: PostgreSQL 15+ avec Prisma ORM
- **Authentification**: JWT avec Refresh Tokens

## 📁 Structure du Projet

```
medical-qcm-platform/
├── backend/          # API NestJS
├── frontend/         # Application Next.js
├── docker-compose.yml
└── README.md
```

## 🛠️ Installation

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (ou via Docker)

### Démarrage Rapide

1. **Cloner et installer les dépendances**:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Démarrer la base de données**:
```bash
docker-compose up -d postgres
```

3. **Configurer les variables d'environnement**:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

4. **Initialiser la base de données**:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

5. **Démarrer les serveurs**:
```bash
# Backend (port 3000)
cd backend
npm run start:dev

# Frontend (port 3001)
cd frontend
npm run dev
```

## 📚 Documentation

- [Documentation API](./backend/README.md)
- [Guide Frontend](./frontend/README.md)
- [Architecture](./docs/ARCHITECTURE.md)

## 🧪 Tests

```bash
# Backend
cd backend
npm run test
npm run test:e2e

# Frontend
cd frontend
npm run test
```

## 📝 License

MIT

