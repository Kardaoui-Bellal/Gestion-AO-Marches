const Marche = require("../models/marcheModel");

const alerteController = {
    // GET /alertes — marchés dont l'échéance approche ou qui sont déjà expirés
    async list(req, res) {
        try {
            const echeancesProches = await Marche.getEcheancesProches(30);

            const tousMarches = await Marche.getAll();
            const today = new Date();
            const marchesExpires = tousMarches.filter((m) => {
                if (/expir/i.test(m.statut_libelle || "")) return true;
                return m.date_fin && new Date(m.date_fin) < today;
            });

            res.render("alertes/liste", {
                title: "Alertes",
                echeancesProches,
                marchesExpires,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement des alertes." });
        }
    },
};

module.exports = alerteController;
