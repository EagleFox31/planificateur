# Theme System

Ce dossier contient le système de thème centralisé pour maintenir la cohérence visuelle de l'application.

## Structure

- `theme.css` : Variables CSS globales
- `theme.ts` : Constantes TypeScript et classes utilitaires

## Utilisation

### CSS Variables

Toutes les couleurs sont définies dans `:root` dans `theme.css` :

```css
:root {
  --primary: #4c6ef5;
  --surface-card: #1e293b;
  /* ... */
}
```

### TypeScript

Importez les constantes depuis `theme.ts` :

```typescript
import { COLORS, THEME_CLASSES } from '../styles/theme';

// Utilisation directe
const primaryColor = COLORS.primary;

// Classes utilitaires
<div className={THEME_CLASSES.card}>
<div className={THEME_CLASSES.button.primary}>
```

### Modification du thème

1. **Changer une couleur** : Modifiez la valeur dans `theme.css`
2. **Ajouter une couleur** : Ajoutez dans `:root` et dans `COLORS`
3. **Ajouter une classe** : Ajoutez dans `THEME_CLASSES`

Toutes les modifications s'appliquent automatiquement partout grâce aux variables CSS.

## Avantages

- ✅ **Cohérence** : Une seule source de vérité
- ✅ **Maintenance** : Changements faciles et globaux
- ✅ **TypeScript** : Autocomplétion et sécurité de type
- ✅ **Performance** : Variables CSS natives
- ✅ **Thèmes futurs** : Support pour thèmes clair/sombre