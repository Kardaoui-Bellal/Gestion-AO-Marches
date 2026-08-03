# Installation

Guide d'installation détaillé. Pour un démarrage rapide, voir le `README.md` à la racine du projet.

## Prérequis

| Outil | Version | Vérifier avec |
|---|---|---|
| Node.js | 18 ou supérieur | `node -v` |
| npm | fourni avec Node.js | `npm -v` |
| MySQL | 8.x (ou MariaDB équivalent) | `mysql --version` |
| Git | toute version récente | `git --version` |

## 1. Cloner le projet

```bash
git clone https://github.com/Kardaoui-Bellal/Gestion-AO-Marches.git
cd Gestion-AO-Marches
```

## 2. Installer les dépendances

```bash
npm install
```

Installe toutes les dépendances listées dans `package.json` (Express, mysql2, EJS, bcrypt, multer, express-session, express-mysql-session, pdfkit, exceljs...).

## 3. Configurer `.env`

Copiez le fichier d'exemple :

```bash
cp .env.example .env
```

Puis éditez `.env` :

```env
# --- Base de données MySQL ---
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=ormvasm_ao_marches

# --- Serveur ---
PORT=3000

# --- Session ---
SESSION_SECRET=changez_ce_secret_en_production

# --- Compte admin de test (utilisé par database/seed.js) ---
ADMIN_LOGIN=admin
ADMIN_PASSWORD=Admin@2026
ADMIN_NOM=Administrateur Bureau Informatique
```

| Variable | Description |
|---|---|
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Connexion MySQL |
| `PORT` | Port d'écoute du serveur Express |
| `SESSION_SECRET` | Clé de signature des cookies de session — à changer impérativement en production |
| `ADMIN_LOGIN` / `ADMIN_PASSWORD` / `ADMIN_NOM` | Identifiants du compte administrateur créé par `npm run seed` |

## 4. Créer la base de données

```bash
mysql -u root -p -e "CREATE DATABASE ormvasm_ao_marches CHARACTER SET utf8mb4;"
```

Le jeu de caractères `utf8mb4` est nécessaire pour les accents et caractères spéciaux du français.

## 5. Importer le schéma

```bash
mysql -u root -p ormvasm_ao_marches < database/database.sql
```

Crée les 9 tables de l'application (voir [`DATABASE.md`](DATABASE.md) pour le détail du modèle).

## 6. Peupler les référentiels (obligatoire)

```bash
mysql -u root -p ormvasm_ao_marches < database/referentiels_seed.sql
```

L'application dépend entièrement de cette table pour ses listes déroulantes (statuts, types, rôles...) — **rien ne fonctionne correctement sans cette étape.**

## 7. Créer les comptes / données de test

Deux options, voir [`SEED_DATA.md`](SEED_DATA.md) pour le détail :

```bash
# Option A — juste un compte admin, base propre
npm run seed

# Option B — jeu de données complet pour tester l'application
node database/seedDemo.js
```

## 8. Démarrer l'application

```bash
# Développement (rechargement automatique via nodemon)
npm run dev

# Production
npm start
```

L'application est accessible sur `http://localhost:3000` (ou le port défini dans `.env`).

## Dépannage rapide

| Symptôme | Cause probable |
|---|---|
| `Missing environment variable` au démarrage | Un champ de `.env` est vide ou absent — comparez avec `.env.example` |
| `ER_ACCESS_DENIED_ERROR` | Identifiants MySQL incorrects dans `.env` |
| Dropdowns vides partout dans l'app | L'étape 6 (référentiels) n'a pas été exécutée |
| `ECONNREFUSED` sur la connexion MySQL | Le service MySQL n'est pas démarré, ou `DB_HOST`/`DB_PORT` sont incorrects |