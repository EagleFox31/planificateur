# Déploiement Vercel + Koyeb + MongoDB Atlas

## Préparation locale

### 1. Migration vers MongoDB
```bash
# Installer MongoDB driver
cd backend
npm install mongodb mongoose

# Créer modèles Mongoose
# models/Participant.js
const mongoose = require('mongoose');
const participantSchema = new mongoose.Schema({
  id: Number,
  name: String,
  age: Number,
  gender: String,
  spiritualRole: String,
  affiliation: Array,
  unavailabilities: Array,
  notes: String,
  assignmentHistory: Array,
  isExcluded: Boolean,
  exclusionEndDate: String
});
module.exports = mongoose.model('Participant', participantSchema);
```

### 2. Configuration MongoDB
```javascript
// backend/server.js - Ajouter connexion MongoDB
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

### 3. Variables d'environnement
```bash
# .env.production
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/planificateur
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-app.vercel.app
```

### 4. Build optimisation
```bash
# backend/package.json - Ajouter
"scripts": {
  "build": "echo 'No build step required'"
}

# frontend/package.json - Ajouter
"scripts": {
  "export": "npm run build"
}
```

## Déploiement

### 1. MongoDB Atlas
- Créer compte sur https://cloud.mongodb.com
- Créer un cluster gratuit (M0)
- Créer une base de données "planificateur"
- Créer un utilisateur avec droits de lecture/écriture
- Whitelister l'IP 0.0.0.0/0 pour les déploiements
- Copier la connection string

### 2. Déploiement Backend sur Koyeb
- Créer compte sur https://koyeb.com
- Créer un service "Web Service"
- Connecter le repo GitHub
- Configuration :
  - Runtime : Node.js
  - Build Command : `cd backend && npm install`
  - Start Command : `cd backend && npm start`
  - Port : 8080
  - Variables d'environnement :
    - MONGODB_URI
    - JWT_SECRET
    - FRONTEND_URL
    - NODE_ENV=production

### 3. Déploiement Frontend sur Vercel
- Créer compte sur https://vercel.com
- Importer le projet depuis GitHub
- Configuration :
  - Framework Preset : Vite
  - Root Directory : `frontend`
  - Build Command : `npm run build`
  - Output Directory : `dist`
  - Environment Variables :
    - VITE_API_URL=https://your-koyeb-app.koyeb.app

### 4. Migration des données
```bash
# Script de migration SQLite vers MongoDB
cd backend
npm install sqlite3
node scripts/migrate-sqlite-to-mongo.js
```

### 5. Configuration finale
- Mettre à jour VITE_API_URL dans Vercel
- Tester les endpoints API
- Vérifier la connexion MongoDB
- Configurer un domaine personnalisé si nécessaire

## Avantages
- Vercel : Déploiement frontend ultra-rapide, preview deployments
- Koyeb : Backend robuste avec auto-scaling
- MongoDB Atlas : Base de données NoSQL flexible, gratuite pour petits projets
- Intégration GitHub native

## Coûts
- Vercel : Gratuit (limites généreuses)
- Koyeb : $15/mois pour 1GB RAM (plan Hobby)
- MongoDB Atlas : Gratuit (512MB stockage)

## Architecture
```
Internet → Vercel (Frontend) → Koyeb (Backend API) → MongoDB Atlas (Database)
```

## Monitoring
- Vercel : Analytics intégrés
- Koyeb : Logs et métriques
- MongoDB Atlas : Monitoring de performance