const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { estAuthentifie } = require('../middlewares/authMiddleware');

// Formulaire de connexion
router.get('/login', authController.afficherFormulaireLogin);
router.post('/login', authController.connecter);

// Déconnexion
router.get('/logout', authController.deconnecter);

// Exemple de route protégée — à remplacer par le vrai tableau de bord
router.get('/dashboard', estAuthentifie, (req, res) => {
  res.send(`Bienvenue ${req.session.utilisateur.nomComplet} (rôle : ${req.session.utilisateur.role})`);
});

module.exports = router;

