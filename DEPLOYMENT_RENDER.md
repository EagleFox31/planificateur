# Déploiement sur Render

## Préparation locale

### 1. Migration base de données
```bash
# Installer les dépendances de migration
cd backend
npm install --save-dev sequelize-cli

# Créer un script de migration SQLite vers PostgreSQL
# Dans backend/package.json, ajouter :
"scripts": {
  "migrate-to-postgres": "node scripts/migrate-to-postgres.js"
}
```

### 2. Configuration environnement
```bash
# Créer .env.production
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-app.onrender.com
```

### 3. Build et optimisation
```bash
# Backend
cd backend
npm run build
npm prune --production

# Frontend
cd frontend
npm run build
```

## Déploiement sur Render

### 1. Créer compte Render
- Aller sur https://render.com
- Créer un compte gratuit

### 2. Déployer la base de données
- Créer un service PostgreSQL
- Copier l'URL de connexion

### 3. Déployer le backend
- Créer un service "Web Service"
- Connecter le repo GitHub
- Configuration :
  - Runtime : Node
  - Build Command : `cd backend && npm install`
  - Start Command : `cd backend && npm start`
  - Environment : Production
  - Variables d'environnement : Copier depuis .env.production

### 4. Déployer le frontend
- Créer un service "Static Site"
- Connecter le repo GitHub
- Configuration :
  - Build Command : `cd frontend && npm install && npm run build`
  - Publish Directory : `frontend/dist`
  - Environment : Production

### 5. Configuration finale
- Mettre à jour FRONTEND_URL dans les variables backend
- Tester les endpoints API
- Vérifier le build du frontend

## Avantages
- Déploiement automatique depuis Git
- Base de données PostgreSQL incluse
- SSL automatique
- Monitoring basique

## Coûts
- Web Service : $7/mois (750h)
- PostgreSQL : $7/mois
- Static Site : Gratuit