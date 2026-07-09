/**
 * Étape 0.1 - Initialisation du projet
 * Point d'entrée de l'application (Express + session + routes).
 */
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const { isAuthenticated } = require('./middlewares/auth');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret_en_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8 // 8 heures
  }
}));

// Fichiers statiques (Bootstrap local si téléchargé, CSS/JS maison)
app.use(express.static(path.join(__dirname, 'public')));

// Routes d'authentification
app.use('/auth', authRoutes);

// Page racine : redirige selon l'état de connexion
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard.html');
  }
  return res.redirect('/login.html');
});

// Page de connexion (publique)
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Page protégée de test : tableau de bord (accessible seulement si connecté)
app.get('/dashboard.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur ORMVA/SM démarré sur http://localhost:${PORT}`);
});
