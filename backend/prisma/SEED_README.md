# Guide du Seed de la Base de Données

Ce fichier explique comment utiliser le script de seed pour remplir la base de données avec des données de test.

## Utilisation

Pour exécuter le seed :

```bash
npm run prisma:seed
```

## Données créées

Le seed crée les données suivantes :

### 1. Années académiques (6)
- 1ère année
- 2ème année
- 3ème année
- 4ème année
- 5ème année
- 6ème année

### 2. Semestres (12)
- S1 à S12 (2 semestres par année)

### 3. Modules (4 pour S1)
- Anatomie (ANAT)
- Physiologie (PHYS)
- Biochimie (BIOC)
- Histologie (HIST)

### 4. Parties (3 pour Anatomie)
- Anatomie du système osseux
- Anatomie du système musculaire
- Anatomie du système nerveux

### 5. Chapitres (3)
- Le crâne
- Le rachis
- Le thorax

### 6. Session (1)
- Session normale 2024 pour le chapitre "Le crâne"

### 7. Questions (5)
- 3 questions à choix unique
- 1 question à choix multiples
- 1 question vrai/faux

### 8. Utilisateurs de test (3)
- **Admin**: `admin@medical-qcm.com` / `password123`
- **Étudiant 1**: `student1@medical-qcm.com` / `password123`
- **Étudiant 2**: `student2@medical-qcm.com` / `password123`

## Réexécution du seed

Le script utilise `upsert` pour éviter les doublons. Vous pouvez réexécuter le seed sans problème, il mettra à jour les données existantes ou créera celles qui manquent.

## Note

Pour réinitialiser complètement la base de données, décommentez les lignes de suppression au début du fichier `seed.ts` (lignes 11-20).

