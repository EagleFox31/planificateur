# Plan d'Implémentation de l'Import de Participants

## Objectif
Créer une interface frontend pour importer une liste de participants via CSV, puis attribuer des rôles spirituels et des affiliations familiales de manière interactive, avant d'enregistrer en base de données.

## Étapes d'Implémentation

### 1. Backend - Ajout d'Endpoint Bulk
- **Fichier:** `backend/routes/participants.js`
- **Action:** Ajouter une route POST `/bulk` pour insérer plusieurs participants en une fois.
- **Code:**
  ```javascript
  router.post('/bulk', async (req, res) => {
    try {
      const newParticipants = await Participant.insertMany(req.body);
      res.status(201).json(newParticipants);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  ```

### 2. Frontend - API Service
- **Fichier:** `frontend/services/api.ts`
- **Action:** Ajouter fonction `bulkCreateParticipants` pour appeler l'endpoint bulk.
- **Code:**
  ```typescript
  export const bulkCreateParticipants = async (participants: Omit<Participant, 'id'>[]): Promise<Participant[]> => {
    const response = await api.post('/participants/bulk', participants);
    return response.data;
  };
  ```

### 3. Frontend - Composant d'Import
- **Fichier:** `frontend/components/ParticipantsManager.tsx`
- **Actions:**
  - Ajouter bouton "Importer" à côté de "Ajouter un participant".
  - Créer un modal d'import avec input file pour CSV.
  - Parser le CSV (format: name,age,gender).
  - Afficher un wizard pour chaque participant importé.

### 4. Wizard d'Attribution
- **Composant:** Nouveau composant `ImportWizard.tsx`
- **Étapes par Participant:**
  1. Afficher nom, âge, genre (non modifiable).
  2. Sélectionner rôle spirituel.
  3. Ajouter affiliations (relation + participant existant ou importé).
- **Gestion des IDs:** Récupérer le max ID existant, assigner séquentiellement aux nouveaux.

### 5. Gestion des Affiliations
- Dropdown pour sélectionner participant: liste existante + liste importée (avec noms temporaires).
- Pour les nouveaux, utiliser des IDs temporaires négatifs, remplacer par réels lors de la sauvegarde.

### 6. Sauvegarde Finale
- Après validation de tous les participants, POST bulk au backend.
- Actualiser la liste des participants.
- Gestion d'erreurs si insertion échoue.

### 7. Tests
- Tester import CSV valide.
- Tester attribution rôle et affiliations.
- Tester sauvegarde et récupération en BD.
- Tester cas d'erreur (CSV invalide, doublons, etc.).

## Dépendances
- Ajouter `papaparse` pour parsing CSV si nécessaire.
- `npm install papaparse` dans frontend.

## Risques
- Gestion des IDs uniques.
- Performance si liste importée grande.
- Validation des données (âge positif, genre valide, etc.).

## Livrables
- Code backend et frontend fonctionnel.
- Interface utilisateur intuitive.
- Documentation dans ce fichier.
