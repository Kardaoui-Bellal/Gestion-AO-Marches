const userModel = require('../models/userModel');

const authController = {
  // Affiche le formulaire de connexion
  afficherFormulaireLogin(req, res) {
    // Si déjà connecté, on redirige directement
    if (req.session.utilisateur) {
      return res.redirect('/dashboard');
    }
    res.render('login', { erreur: null });
  },

  // Traite la soumission du formulaire de connexion
  async connecter(req, res) {
    const { email, motDePasse } = req.body;

    try {
      if (!email || !motDePasse) {
        return res.render('login', { erreur: 'Veuillez renseigner votre email et votre mot de passe.' });
      }

      const utilisateur = await userModel.findByEmail(email);

      if (!utilisateur) {
        return res.render('login', { erreur: 'Identifiants incorrects.' });
      }

      const motDePasseValide = await userModel.verifierMotDePasse(motDePasse, utilisateur.mot_de_passe);

      if (!motDePasseValide) {
        return res.render('login', { erreur: 'Identifiants incorrects.' });
      }

      // On ne stocke jamais le hash du mot de passe en session
      req.session.utilisateur = {
        id: utilisateur.id,
        nomComplet: utilisateur.nom_complet,
        email: utilisateur.email,
        role: utilisateur.role
      };

      res.redirect('/dashboard');
    } catch (err) {
      console.error('Erreur lors de la connexion :', err);
      res.render('login', { erreur: 'Une erreur est survenue. Veuillez réessayer.' });
    }
  },

  // Déconnexion : détruit la session
  deconnecter(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur lors de la déconnexion :', err);
      }
      res.redirect('/login');
    });
  }
};

module.exports = authController;
