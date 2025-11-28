# Déploiement sur Northflank

## Préparation locale

### 1. Dockerisation
```bash
# Créer Dockerfile.backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]

# Créer Dockerfile.frontend
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Configuration Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    depends_on:
      - backend

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=planificateur
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 3. Variables d'environnement
```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:password@postgres:5432/planificateur
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-app.northflank.app
```

## Déploiement sur Northflank

### 1. Créer compte Northflank
- Aller sur https://northflank.com
- Créer un compte (plan gratuit disponible)

### 2. Créer un projet
- Créer un nouveau projet
- Connecter le repo GitHub

### 3. Déployer la base de données
- Ajouter un service "PostgreSQL"
- Configurer les credentials
- Noter l'URL de connexion interne

### 4. Déployer le backend
- Créer un service "Deployment"
- Sélectionner Docker
- Configuration :
  - Build Context : `/backend`
  - Dockerfile : `Dockerfile.backend`
  - Port : 3001
  - Variables d'environnement

### 5. Déployer le frontend
- Créer un service "Deployment"
- Sélectionner Docker
- Configuration :
  - Build Context : `/frontend`
  - Dockerfile : `Dockerfile.frontend`
  - Port : 80

### 6. Configuration réseau
- Créer un load balancer
- Router le trafic vers frontend (port 80) et backend (port 3001)
- Configurer les domaines personnalisés

### 7. Migration des données
```bash
# Script de migration SQLite vers PostgreSQL
npm install pg sqlite3
node scripts/migrate-to-postgres.js
```

## Avantages
- Support Docker natif
- Interface moderne et intuitive
- Auto-scaling
- Monitoring avancé
- Support multi-régions

## Coûts
- Plan gratuit : 2 services, 1GB RAM, 10GB stockage
- Plan Pro : À partir de $15/mois
- PostgreSQL managé : Inclus dans les plans payants