const Utilisateur = require("../models/utilisateurModel");

const parametresController = {
    // GET /parametres — profil du compte connecté
    async show(req, res) {
        try {
            const utilisateur = await Utilisateur.findById(req.session.user.id_utilisateur);
            res.render("parametres/index", {
                title: "Paramètres",
                utilisateur,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement des paramètres." });
        }
    },
};

module.exports = parametresController;