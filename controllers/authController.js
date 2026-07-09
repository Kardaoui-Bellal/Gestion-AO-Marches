/**
 * Étape 0.3 - Page Connexion
 * Vérifie le login + mot de passe (hash bcrypt), gère la session.
 */
const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function login(req, res) {
  try {
    const { login, mot_de_passe } = req.body;

    if (!login || !mot_de_passe) {
      return res.status(400).json({ message: 'Login et mot de passe requis.' });
    }

    const [rows] = await pool.query(
      'SELECT id_utilisateur, nom, login, mot_de_passe, profil, actif FROM utilisateurs WHERE login = ? LIMIT 1',
      [login]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const utilisateur = rows[0];

    if (!utilisateur.actif) {
      return res.status(403).json({ message: 'Ce compte a été désactivé. Contactez un administrateur.' });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    // Régénère l'identifiant de session pour éviter la fixation de session
    req.session.regenerate((err) => {
      if (err) {
        console.error('Erreur régénération session:', err);
        return res.status(500).json({ message: 'Erreur serveur.' });
      }

      req.session.user = {
        id: utilisateur.id_utilisateur,
        nom: utilisateur.nom,
        login: utilisateur.login,
        profil: utilisateur.profil
      };

      // Redirection selon le profil (Admin / Consultation) -> même page d'accueil,
      // les droits sont ensuite gérés par les middlewares sur chaque route.
      return res.status(200).json({
        message: 'Connexion réussie.',
        redirect: '/dashboard.html',
        user: req.session.user
      });
    });
  } catch (error) {
    console.error('Erreur login:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la déconnexion.' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Déconnexion réussie.', redirect: '/login.html' });
  });
}

function me(req, res) {
  if (req.session && req.session.user) {
    return res.status(200).json({ user: req.session.user });
  }
  return res.status(401).json({ message: 'Non authentifié.' });
}

module.exports = { login, logout, me };
