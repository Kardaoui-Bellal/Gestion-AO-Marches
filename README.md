# Page de connexion — ORMVA/SM Bureau Informatique

Implémentation des **Étapes 0.1, 0.2 et 0.3** du plan de développement :
Base de données (MySQL) → Backend (Node.js/Express) → Frontend (Bootstrap 5).

## Structure du projet

```
ormvasm-ao-marches/
├── package.json
├── .env.example
├── server.js
├── config/
│   └── db.js              # Connexion MySQL (pool mysql2)
├── middlewares/
│   └── auth.js            # isAuthenticated, isAdmin
├── controllers/
│   └── authController.js  # login, logout, me
├── routes/
│   └── authRoutes.js      # POST /auth/login, POST /auth/logout, GET /auth/me
├── database/
│   ├── schema.sql         # Schéma complet (Étape 0.2 - toutes les tables)
│   └── seed.js            # Crée l'admin de test (mot de passe haché bcrypt)
└── views/
    ├── login.html          # Page de connexion (Bootstrap 5)
    └── dashboard.html      # Page protégée de test après connexion
```

## Étapes exactes d'installation

### 1. Installer les dépendances
```bash
cd ormvasm-ao-marches
npm install
```

### 2. Configurer les variables d'environnement
```bash
cp .env.example .env
```
Modifier `.env` avec vos identifiants MySQL et le login/mot de passe admin souhaités.

### 3. Créer la base de données et les tables
```bash
mysql -u root -p < database/schema.sql
```
Cela crée la base `ormvasm_ao_marches` et **toutes les tables** du CDC
(utilisateurs, referentiels, fournisseurs, appels_offres, marches, documents,
checklist_dossier, historique), avec `ON DELETE RESTRICT` partout et des
champs `actif`/`archive` pour interdire toute suppression physique.

### 4. Insérer l'administrateur de test
```bash
npm run seed
```
Ceci hache le mot de passe avec bcrypt avant insertion (jamais de mot de passe en clair en base).

### 5. Démarrer le serveur
```bash
npm start
```
ou en mode développement (rechargement automatique) :
```bash
npm run dev
```

### 6. Tester
Ouvrir `http://localhost:3000` → redirection automatique vers `/login.html`.
Se connecter avec le login/mot de passe définis dans `.env` (par défaut `admin` / `Admin@2026`).
Une connexion réussie redirige vers `/dashboard.html`, qui est protégée par le
middleware `isAuthenticated`.

## Résultat testable (conforme au plan)
- ✅ `POST /auth/login` vérifie le login + mot de passe haché (bcrypt.compare).
- ✅ `POST /auth/logout` détruit la session.
- ✅ Middleware `isAuthenticated` bloque l'accès aux pages protégées si non connecté.
- ✅ Middleware `isAdmin` prêt pour les routes réservées à l'administrateur (Phase 13).
- ✅ Page `login.html` : formulaire Bootstrap simple, centré, en carte.
- ✅ Redirection selon le profil (Administrateur / Consultation) gérée via `req.session.user.profil`.

## Prochaines étapes (suite du plan)
Phase 1 — Référentiels paramétrables, puis Phase 2 — Module Fournisseurs, etc.,
en suivant l'ordre du fichier `Plan_Developpement_Pages.md`.
