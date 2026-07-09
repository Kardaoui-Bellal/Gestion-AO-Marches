/**
 * Étape 0.3 - Page Connexion
 * Middlewares de protection des routes selon la session.
 */

// Bloque l'accès si l'utilisateur n'est pas connecté
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  // Si la requête attend du JSON (appel API), on renvoie une erreur 401
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ message: 'Non authentifié. Veuillez vous connecter.' });
  }

  // Sinon on redirige vers la page de connexion
  return res.redirect('/login.html');
}

// Bloque l'accès si le profil n'est pas Administrateur
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.profil === 'Administrateur') {
    return next();
  }
  return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
}

module.exports = { isAuthenticated, isAdmin };
