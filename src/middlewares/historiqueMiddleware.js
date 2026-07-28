const Historique = require("../models/historiqueModel");

/**
 * Middleware d'historisation.
 *
 * Journalise automatiquement une action dans la table `historique` une fois
 * que la réponse a été envoyée au client (on n'échoue jamais la requête
 * métier à cause d'un problème de journalisation).
 *
 * Utilisation dans une route :
 *
 *   const { logAction } = require("../middlewares/historiqueMiddleware");
 *
 *   router.post("/:id/toggle",
 *     logAction("UPDATE", "FOURNISSEUR", (req) => req.params.id, (req) =>
 *       `Changement de statut du fournisseur #${req.params.id}`),
 *     fournisseurController.toggleActif
 *   );
 */

// résout une valeur qui peut être une constante ou une fonction (req, res) => valeur
function resolve(value, req, res) {
  return typeof value === "function" ? value(req, res) : value;
}

function logAction(action, entite_type, entite_id, details) {
  return function (req, res, next) {
    res.on("finish", async () => {
      // on ne journalise que les requêtes réussies (2xx / 3xx)
      if (res.statusCode >= 400) return;

      const user = req.session && req.session.user ? req.session.user : null;
      if (!user) return;

      try {
        await Historique.log({
          utilisateur_id: user.id_utilisateur,
          action: resolve(action, req, res),
          entite_type: resolve(entite_type, req, res),
          entite_id: resolve(entite_id, req, res),
          details: details ? resolve(details, req, res) : null,
        });
      } catch (err) {
        // la journalisation ne doit jamais casser le flux applicatif
        console.error("[historiqueMiddleware] échec de journalisation :", err.message);
      }
    });

    next();
  };
}

/**
 * Variante utilitaire : journalise un changement de champ précis.
 * Les valeurs avant/après sont lues depuis res.locals.historique, que le
 * contrôleur peut renseigner avant d'envoyer sa réponse :
 *
 *   res.locals.historique = { champ_modifie: 'statut_id', ancienne_valeur, nouvelle_valeur };
 */
function logChamp(entite_type, entite_id) {
  return function (req, res, next) {
    res.on("finish", async () => {
      if (res.statusCode >= 400) return;

      const user = req.session && req.session.user ? req.session.user : null;
      const change = res.locals && res.locals.historique ? res.locals.historique : null;
      if (!user || !change) return;

      try {
        await Historique.log({
          utilisateur_id: user.id_utilisateur,
          action: "UPDATE",
          entite_type: resolve(entite_type, req, res),
          entite_id: resolve(entite_id, req, res),
          champ_modifie: change.champ_modifie || null,
          ancienne_valeur: change.ancienne_valeur || null,
          nouvelle_valeur: change.nouvelle_valeur || null,
          details: change.details || null,
        });
      } catch (err) {
        console.error("[historiqueMiddleware] échec de journalisation :", err.message);
      }
    });

    next();
  };
}

module.exports = { logAction, logChamp };
