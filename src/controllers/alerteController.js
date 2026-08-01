const Marche = require("../models/marcheModel");

function toMidnight(d) {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const alerteController = {
    // GET /alertes — marchés dont l'échéance approche, est lointaine, ou déjà expirés
    async list(req, res) {
        try {
            const today = toMidnight(new Date());

            // Fenêtre large (10 ans) pour récupérer toutes les échéances futures en un seul
            // appel, puis on les répartit nous-même entre "proches" (≤30j) et "lointaines" (>30j) —
            // évite une deuxième requête SQL, et garde le tri (le plus proche en premier) intact
            // dans les deux groupes puisqu'on filtre un tableau déjà trié par date croissante.
            const toutesEcheances = await Marche.getEcheancesProches(3650);
            const echeancesAvecJours = toutesEcheances.map((m) => {
                const dateEch = toMidnight(m.date_prochaine_echeance);
                const joursRestants = Math.round((dateEch - today) / MS_PER_DAY);
                return { ...m, jours_restants: joursRestants };
            });

            const echeancesProches = echeancesAvecJours.filter((m) => m.jours_restants <= 30);
            const echeancesLointaines = echeancesAvecJours.filter((m) => m.jours_restants > 30);

            const tousMarches = await Marche.getAll();
            const marchesExpires = tousMarches
                .filter((m) => {
                    if (/expir/i.test(m.statut_libelle || "")) return true;
                    return m.date_fin && new Date(m.date_fin) < today;
                })
                .map((m) => {
                    const dateFin = m.date_fin ? toMidnight(m.date_fin) : null;
                    const joursRetard = dateFin ? Math.round((today - dateFin) / MS_PER_DAY) : null;
                    return { ...m, jours_retard: joursRetard };
                });

            res.render("alertes/liste", {
                title: "Alertes",
                echeancesProches,
                echeancesLointaines,
                marchesExpires,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement des alertes." });
        }
    },
};

module.exports = alerteController;