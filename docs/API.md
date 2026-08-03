# Référence des routes

Toutes les routes ci-dessous nécessitent une session active, sauf `/auth/login`. La colonne **Rôles** liste les valeurs acceptées par `requireRole(...)` sur cette route.

## Authentification — `/auth`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/login` | public | Formulaire de connexion |
| POST | `/login` | public | Authentification |
| POST | `/logout` | tous | Déconnexion |

## Appels d'offres — `/appels-offres`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/` | ADMIN, GESTIONNAIRE, CONSULTANT | Liste des AO |
| GET | `/new` | ADMIN, GESTIONNAIRE | Formulaire de création |
| GET | `/:id` | ADMIN, GESTIONNAIRE, CONSULTANT | Détail d'un AO |
| GET | `/:id/edit` | ADMIN, GESTIONNAIRE | Formulaire de modification |
| POST | `/` | ADMIN, GESTIONNAIRE | Création |
| POST | `/:id` | ADMIN, GESTIONNAIRE | Modification |
| POST | `/:id/attribuer` | ADMIN, GESTIONNAIRE | Attribution à un fournisseur |
| POST | `/:id/statut` | ADMIN, GESTIONNAIRE | Changement d'état |
| GET | `/:aoId/offres/new` | ADMIN, GESTIONNAIRE | Formulaire de nouvelle offre sur cet AO |
| POST | `/:aoId/offres` | ADMIN, GESTIONNAIRE | Soumission d'une offre |

## Offres — `/offres`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/:id/edit` | ADMIN, GESTIONNAIRE | Formulaire de modification |
| POST | `/:id` | ADMIN, GESTIONNAIRE | Modification |
| POST | `/:id/statut` | ADMIN, GESTIONNAIRE | Changement de statut |

## Marchés — `/marches`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/echeances` | ADMIN, GESTIONNAIRE, CONSULTANT | Vue des prochaines échéances |
| GET | `/` | ADMIN, GESTIONNAIRE, CONSULTANT | Liste des marchés |
| GET | `/new` | ADMIN, GESTIONNAIRE | Formulaire de création |
| GET | `/:id` | ADMIN, GESTIONNAIRE, CONSULTANT | Détail d'un marché |
| GET | `/:id/edit` | ADMIN, GESTIONNAIRE | Formulaire de modification |
| GET | `/:id/fiche` | ADMIN, GESTIONNAIRE, CONSULTANT | Fiche imprimable |
| POST | `/` | ADMIN, GESTIONNAIRE | Création |
| POST | `/:id` | ADMIN, GESTIONNAIRE | Modification |
| POST | `/:id/statut` | ADMIN, GESTIONNAIRE | Changement de statut |

> Aucune route de suppression — voir [`ARCHITECTURE.md`](ARCHITECTURE.md) : les marchés et AO sont archivés par changement de statut, jamais supprimés.

## Fournisseurs — `/fournisseurs`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/` | ADMIN, GESTIONNAIRE, CONSULTANT | Liste |
| GET | `/search` | ADMIN, GESTIONNAIRE, CONSULTANT | Recherche par ICE |
| GET | `/new` | ADMIN, GESTIONNAIRE | Formulaire de création |
| GET | `/:id` | ADMIN, GESTIONNAIRE, CONSULTANT | Détail |
| GET | `/:id/edit` | ADMIN, GESTIONNAIRE | Formulaire de modification |
| POST | `/` | ADMIN, GESTIONNAIRE | Création |
| POST | `/:id` | ADMIN, GESTIONNAIRE | Modification |
| POST | `/:id/toggle` | ADMIN, GESTIONNAIRE | Activer/désactiver |

## Checklist — `/checklist`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/:type_entite/:id` | ADMIN, GESTIONNAIRE, CONSULTANT | Vue complète (`type_entite` = `AO` ou `MARCHE`) |
| POST | `/:id` | ADMIN, GESTIONNAIRE | Mise à jour d'une étape |

## Documents — `/documents`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/` | ADMIN, GESTIONNAIRE, CONSULTANT | Liste de tous les documents |
| GET | `/upload` | ADMIN, GESTIONNAIRE | Formulaire de dépôt (`?type_entite=&entite_id=`) |
| POST | `/upload` | ADMIN, GESTIONNAIRE | Dépôt effectif (PDF/Word/Excel/JPG/PNG, 10 Mo max) |
| GET | `/:id/download` | ADMIN, GESTIONNAIRE, CONSULTANT | Téléchargement |
| POST | `/:id/archive` | ADMIN, GESTIONNAIRE | Archivage |

## Référentiels — `/referentiels`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/` | ADMIN | Liste groupée par type |
| GET | `/new` | ADMIN | Formulaire de création |
| GET | `/:id/edit` | ADMIN | Formulaire de modification |
| POST | `/` | ADMIN | Création |
| POST | `/:id` | ADMIN | Modification |
| POST | `/:id/toggle` | ADMIN | Activer/désactiver |

## Utilisateurs — `/utilisateurs`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/` | ADMIN | Liste |
| GET | `/new` | ADMIN | Formulaire de création |
| GET | `/:id/edit` | ADMIN | Formulaire de modification |
| GET | `/:id/password` | ADMIN | Formulaire de changement de mot de passe |
| POST | `/` | ADMIN | Création |
| POST | `/:id` | ADMIN | Modification |
| POST | `/:id/password` | ADMIN | Changement de mot de passe |

## Historique — `/historique`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/` | ADMIN | Journal d'audit, filtrable par utilisateur/type d'entité |
| GET | `/entite/:entite_type/:entite_id` | ADMIN | Historique d'une entité précise |

## Alertes — `/alertes`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/` | ADMIN, GESTIONNAIRE, CONSULTANT | Marchés expirés + échéances proches/lointaines |

## Export — `/export`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/appels-offres/pdf` | ADMIN, GESTIONNAIRE | Export PDF des AO |
| GET | `/appels-offres/excel` | ADMIN, GESTIONNAIRE | Export Excel des AO |
| GET | `/marches/pdf` | ADMIN, GESTIONNAIRE | Export PDF des marchés |
| GET | `/marches/excel` | ADMIN, GESTIONNAIRE | Export Excel des marchés |
| GET | `/fournisseurs/excel` | ADMIN, GESTIONNAIRE | Export Excel des fournisseurs |
| GET | `/marches/:id/fiche` | ADMIN, GESTIONNAIRE, CONSULTANT | Fiche PDF d'un marché |

## Paramètres — `/parametres`

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| GET | `/` | tous (authentifié) | Page de paramètres du compte |