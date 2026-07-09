// Vérifie que l'utilisateur est connecté avant d'accéder à une page protégée
function estAuthentifie(req, res, next) {
  if (req.session && req.session.utilisateur) {
    return next();
  }
  return res.redirect('/login');
}

// Vérifie que l'utilisateur possède le rôle "admin"
// À utiliser après estAuthentifie sur les routes réservées à l'administrateur
function estAdmin(req, res, next) {
  if (req.session && req.session.utilisateur && req.session.utilisateur.role === 'admin') {
    return next();
  }
  return res.status(403).send('Accès refusé : réservé aux administrateurs.');
}

module.exports = { estAuthentifie, estAdmin };
