const Historique = require("../models/historiqueModel");
const Utilisateur = require("../models/utilisateurModel");

const historiqueController = {
    // GET /historique — full audit log, admin-only (sensitive: shows all users' actions)
    async list(req, res) {
        try {
            const { utilisateur_id, entite_type } = req.query;

            let historique;

            if (utilisateur_id) {
                historique = await Historique.getByUtilisateur(utilisateur_id);
            } else {
                historique = await Historique.getAll();
            }

            // entite_type filtering isn't supported in the model as a dedicated query,
            // so filter in JS here — fine for an internal audit log at this scale
            if (entite_type) {
                historique = historique.filter(h => h.entite_type === entite_type);
            }

            const utilisateurs = await Utilisateur.getAll();

            res.render("historique/liste", {
                title: "Historique des actions",
                historique,
                utilisateurs,
                filters: { utilisateur_id: utilisateur_id || "", entite_type: entite_type || "" },
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement de l'historique." });
        }
    },

    // GET /historique/entite/:entite_type/:entite_id — audit trail for one specific record
    // (embedded inline on AO/Marché/Fournisseur detail pages, or accessed as a standalone page)
    async getByEntity(req, res) {
        try {
            const { entite_type, entite_id } = req.params;

            const historique = await Historique.getByEntity(entite_type, entite_id);

            res.render("historique/liste", {
                title: `Historique — ${entite_type} #${entite_id}`,
                historique,
                utilisateurs: [],
                filters: { utilisateur_id: "", entite_type },
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement de l'historique." });
        }
    },
};

module.exports = historiqueController;