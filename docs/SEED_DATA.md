# Données de démonstration

Deux scripts distincts permettent de peupler la base, selon le besoin.

> Les deux supposent que `database/database.sql` (schéma) et `database/referentiels_seed.sql` (référentiels) ont déjà été importés — voir [`INSTALL.md`](INSTALL.md).

## `database/seed.js` — compte administrateur seul

```bash
npm run seed
```

```
database/seed.js
      │
      ▼
Crée uniquement :
  - Le compte administrateur défini dans .env
    (ADMIN_LOGIN / ADMIN_PASSWORD / ADMIN_NOM)
```

Usage prévu : déploiement propre (production, ou base de test vierge) où l'on veut uniquement un point d'entrée pour commencer à créer manuellement les autres utilisateurs, fournisseurs, AO, etc. depuis l'interface.

## `database/seedDemo.js` — jeu de données complet

```bash
node database/seedDemo.js
```

```
database/seedDemo.js
      │
      ▼
Vide entièrement les données transactionnelles, puis crée :
  - 3 utilisateurs (un par rôle)
  - 10 fournisseurs (dont 1 inactif)
  - 10 appels d'offres (tous les états représentés)
  - 15 offres réparties sur ces AO
  - 10 marchés (tous les statuts représentés)
  - Les checklists correspondantes (auto-générées comme le ferait l'application)
```

> ⚠️ **Ce script supprime toutes les données existantes** (utilisateurs, fournisseurs, appels d'offres, offres, marchés, checklist, documents, historique) avant de reseeder. À ne jamais exécuter sur une base de production. Les référentiels ne sont jamais touchés — ce sont des données de configuration, pas des données de démonstration.

### Pourquoi ce jeu de données en particulier

Les dates ne sont pas codées en dur : elles sont calculées relativement à la date d'exécution du script (`daysFromNow(n)`), pour que les échéances "dans 5 jours" / "dans 20 jours" restent vraies quelle que soit la date à laquelle vous relancez le script. Les marchés sont volontairement répartis pour couvrir tous les cas testables sur la page `/alertes` :

| Cas | Exemple dans le seed |
|---|---|
| Marché expiré (statut normal + date dépassée) | `M-2025-018` (`ACHEVE`, `date_fin` passée) |
| Marché expiré (résilié avant terme) | `M-2026-005` (`RESILIE`) |
| Marché expiré (statut explicite) | `M-2026-006` (`EXPIRE`) |
| Échéance très urgente (≤ 7 jours) | `M-2026-002` (dans 5 jours), `M-2026-007` (dans 2 jours) |
| Échéance proche (≤ 30 jours) | `M-2026-003` (dans 20 jours), `M-2026-009` (dans 9 jours) |
| Échéance lointaine (> 30 jours) | `M-2026-001`, `M-2026-004`, `M-2026-008` |
| Fournisseur inactif toujours lié à un marché actif | `Maroc Audit & Conseil` ↔ `M-2026-009` |

### Comptes créés

| Rôle | Email | Mot de passe |
|---|---|---|
| ADMIN | `admin@ormvasm.ma` | `admin123` |
| GESTIONNAIRE | `gestionnaire@ormvasm.ma` | `gestion123` |
| CONSULTANT | `consultant@ormvasm.ma` | `consult123` |

> Changez ces mots de passe si cette base sert au-delà de vos tests en local.