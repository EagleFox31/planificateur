---

# Philosophie de l'Algorithme Proposé : L'Approche par Score d'Aptitude

L'idée centrale n'est pas de trouver la solution parfaite (un problème mathématique **NP-difficile**), mais de trouver une **solution très bonne de manière efficace**.

Pour chaque *poste* à pourvoir (exemple : *« Prière d'ouverture » pour la semaine 2024-W32*), l’algorithme évalue les participants éligibles et leur attribue un **score d’aptitude**. Le participant avec le score le plus élevé remporte l’attribution.

---

## Décomposition Logique de l’Algorithme

### Étape 1 : Préparation des Données

* **Identifier les Postes à Pourvoir** : Lister tous les sujets actifs (non archivés).
* **Préparer la Liste des Participants** : Informations à jour (rôle, genre, historique, indisponibilités, affiliations, exclusions).
* **Initialiser l’État de la Semaine** : Suivi des participants déjà assignés pour éviter les doublons.

---

### Étape 2 : Boucle d’Attribution Principale

#### 1. Filtrage (Contraintes Dures)

Élimination des inéligibles selon des règles binaires :

* **Indisponibilité** : participant absent cette semaine.
* **Exclusion** : participant temporairement exclu.
* **Déjà Assigné** : participant déjà attribué cette semaine.
* **Contraintes du Sujet** :

  * requiredGender respecté ?
  * requiredSpiritualRole respecté ?
  * autorisation via RolePermissions ?
* **Règle de Rotation** : a-t-il eu un sujet avec la même *rotationWeeks* trop récemment ?

Résultat :

* Aucun candidat → poste laissé vacant.
* Un candidat → attribution directe.
* Plusieurs candidats → passage au scoring.

---

#### 2. Scoring (Contraintes Souples & Équité)

On calcule un **score de base** (ex. 100), ajusté avec **bonus** et **malus** :

**Malus :**

* Charge de travail globale : -X points par attribution historique.
* Activité récente : -Y points si attribué la semaine précédente.
* Répétition de mainTopic : -Z points pour chaque occurrence passée.

**Bonus :**

* Longévité sans attribution : +A points par semaine d’attente.

---

#### 3. Cas Spécial : Les Binômes (`isBinome: true`)

* **Premier binôme** : attribution standard (meilleur score).
* **Second binôme** : scoring spécifique :

  * Bonus familial énorme : +1000 points si affiliation familiale.
  * Bonus de genre : +200 points si même genre.
  * Les autres bonus/malus s’appliquent mais avec moins de poids.

---

#### 4. Sélection et Mise à Jour

* Le candidat au score le plus élevé est choisi.
* **Égalités** : départage par règle simple (aléatoire, ordre alphabétique, ou moins d’attributions totales).
* **Mise à jour cruciale** :

  * Ajouter le participant à la liste des déjà assignés cette semaine.
  * Mettre à jour son assignmentHistory.

---

### Étape 3 : Finalisation

* Une fois tous les postes attribués → programme complet.
* Répéter pour le nombre de semaines souhaité.

---

## Comparaison des Approches

| Caractéristique      | Algorithme à Score (proposé)  | IA (ex. Gemini)              |
| -------------------- | ----------------------------- | ---------------------------- |
| **Prévisibilité**    | Totale, déterministe          | Variable                     |
| **Vitesse**          | Instantanée, local            | Lente (latence API)          |
| **Coût**             | Nul                           | Payant                       |
| **Transparence**     | Très élevée (scores visibles) | Faible (« boîte noire »)     |
| **Complexité impl.** | Élevée (logique codée)        | Faible (prompt)              |
| **Flexibilité**      | Moyenne (modifier le code)    | Très élevée (prompt textuel) |

---

## Conclusion de la Réflexion

Construire un **algorithme maison** est un excellent investissement :

* Base solide, rapide, fiable, équitable.

Une **approche hybride** peut être optimale :

1. Utiliser l’algorithme à score pour générer une première version **valide à 99%**.
2. Optionnel : transmettre le programme pré-généré à une IA (ex. Gemini) pour apporter des **améliorations subtiles et humaines**.

---

