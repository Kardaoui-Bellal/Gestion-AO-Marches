const Offre = require("../models/offreModel");
const AppelOffre = require("../models/appelOffreModel");
const Fournisseur = require("../models/fournisseurModel");
const Referentiel = require("../models/referentielModel");
const Historique = require("../models/historiqueModel");

const offreController = {
    // GET /appels-offres/:aoId/offres/new
    async showCreateForm(req, res) {
        try {
            const id_ao = req.params.aoId;

            const appelOffre = await AppelOffre.getById(id_ao);
            if (!appelOffre) {
                return res.status(404).render("404", { title: "Appel d'offres introuvable" });
            }

            const fournisseurs = await Fournisseur.getAll();
            const statuts = await Referentiel.getByType("STATUT_OFFRE");

            res.render("offres/form", {
                title: `Nouvelle offre — ${appelOffre.numero_ao}`,
                appelOffre,
                offre: null,
                fournisseurs,
                statuts,
                error: null,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement du formulaire." });
        }
    },

    // GET /offres/:id/edit
    async showEditForm(req, res) {
        try {
            const offre = await Offre.getById(req.params.id);

            if (!offre) {
                return res.status(404).render("404", { title: "Offre introuvable" });
            }

            const appelOffre = await AppelOffre.getById(offre.appel_offre_id);
            const fournisseurs = await Fournisseur.getAll();
            const statuts = await Referentiel.getByType("STATUT_OFFRE");

            res.render("offres/form", {
                title: `Modifier l'offre — ${appelOffre.numero_ao}`,
                appelOffre,
                offre,
                fournisseurs,
                statuts,
                error: null,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement du formulaire." });
        }
    },

    // POST /appels-offres/:aoId/offres
    async create(req, res) {
        const id_ao = req.params.aoId;
        const { fournisseur_id, montant_propose, date_soumission, statut_id } = req.body;

        if (!fournisseur_id || !montant_propose || !statut_id) {
            const appelOffre = await AppelOffre.getById(id_ao);
            const fournisseurs = await Fournisseur.getAll();
            const statuts = await Referentiel.getByType("STATUT_OFFRE");
            return res.render("offres/form", {
                title: `Nouvelle offre — ${appelOffre.numero_ao}`,
                appelOffre,
                offre: req.body,
                fournisseurs,
                statuts,
                error: "Fournisseur, montant proposé et statut sont obligatoires.",
            });
        }

        try {
            const id_offre = await Offre.create({
                appel_offre_id: id_ao,
                fournisseur_id,
                montant_propose,
                date_soumission,
                statut_id,
            });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "INSERT",
                entite_type: "OFFRE",
                entite_id: id_offre,
                details: `Offre reçue pour l'AO #${id_ao}`,
            });

            res.redirect(`/appels-offres/${id_ao}`);
        } catch (err) {
            console.error(err);

            // UNIQUE(appel_offre_id, fournisseur_id) — one offer per supplier per AO
            const error = err.code === "ER_DUP_ENTRY"
                ? "Ce fournisseur a déjà soumis une offre pour cet appel d'offres."
                : "Erreur lors de la création de l'offre.";

            const appelOffre = await AppelOffre.getById(id_ao);
            const fournisseurs = await Fournisseur.getAll();
            const statuts = await Referentiel.getByType("STATUT_OFFRE");
            res.render("offres/form", {
                title: `Nouvelle offre — ${appelOffre.numero_ao}`,
                appelOffre,
                offre: req.body,
                fournisseurs,
                statuts,
                error,
            });
        }
    },

    // POST /offres/:id
    async update(req, res) {
        const id_offre = req.params.id;
        const { montant_propose, date_soumission, statut_id } = req.body;

        try {
            const before = await Offre.getById(id_offre);
            if (!before) {
                return res.status(404).render("404", { title: "Offre introuvable" });
            }

            await Offre.update(id_offre, { montant_propose, date_soumission, statut_id });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPDATE",
                entite_type: "OFFRE",
                entite_id: id_offre,
                champ_modifie: "multiple",
                ancienne_valeur: JSON.stringify({
                    montant_propose: before.montant_propose,
                    date_soumission: before.date_soumission,
                    statut_id: before.statut_id,
                }),
                nouvelle_valeur: JSON.stringify({ montant_propose, date_soumission, statut_id }),
            });

            res.redirect(`/appels-offres/${before.appel_offre_id}`);
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors de la modification de l'offre." });
        }
    },

    // POST /offres/:id/statut — quick status change (admissible / rejetée / retenue)
    async updateStatus(req, res) {
        const id_offre = req.params.id;
        const { statut_id } = req.body;

        try {
            const before = await Offre.getById(id_offre);
            if (!before) {
                return res.status(404).render("404", { title: "Offre introuvable" });
            }

            await Offre.updateStatus(id_offre, statut_id);

            const statuts = await Referentiel.getByType("STATUT_OFFRE");
            const nouveauStatut = statuts.find(s => s.id_ref == statut_id);

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPDATE",
                entite_type: "OFFRE",
                entite_id: id_offre,
                champ_modifie: "statut_id",
                ancienne_valeur: before.statut_libelle,
                nouvelle_valeur: nouveauStatut ? nouveauStatut.libelle : String(statut_id),
            });

            res.redirect(`/appels-offres/${before.appel_offre_id}`);
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du changement de statut." });
        }
    },
};

module.exports = offreController;