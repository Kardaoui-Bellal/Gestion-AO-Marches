const Historique = require("../models/historiqueModel");

// Attaches req.logAction(), a shortcut for Historique.log() that auto-fills
// utilisateur_id from the session so controllers don't repeat it every time.
function historiqueMiddleware(req, res, next) {
    req.logAction = async (logData) => {
        if (!req.session?.user?.id_utilisateur) {
            console.error("logAction appelé sans utilisateur en session — log ignoré.");
            return null;
        }

        return Historique.log({
            utilisateur_id: req.session.user.id_utilisateur,
            ...logData,
        });
    };

    next();
}

module.exports = historiqueMiddleware;