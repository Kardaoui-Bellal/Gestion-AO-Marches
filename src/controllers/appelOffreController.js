const AppelOffre = require("../models/appelOffreModel");
const Offre = require("../models/offreModel");
const Checklist = require("../models/checklistModel");
const Document = require("../models/documentModel");
const Fournisseur = require("../models/fournisseurModel");
const Referentiel = require("../models/referentielModel");
const Historique = require("../models/historiqueModel");
const pool = require("../../config/db");

const appelOffreController = {
    // GET /appels-offres — list with optional filters
    async list(req, res) {
        try {
            const { categorie_id, etat_id } = req.query;

            const appelsOffres = await AppelOffre.getByFilters({ categorie_id, etat_id });
            const categories = await Referentiel.getByType("CATEGORIE_AO");
            const etats = await Referentiel.getByType("ETAT_AO");

            res.render("appels_offres/liste", {
                title: "Appels d'offres",
                appelsOffres,
                categories,
                etats,
                filters: { categorie_id: categorie_id || "", etat_id: etat_id || "" },
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement des appels d'offres." });
        }
    },

    // GET /appels-offres/:id — full detail: offres, checklist, documents
    async detail(req, res) {
        try {
            const id_ao = req.params.id;

            const appelOffre = await AppelOffre.getById(id_ao);
            if (!appelOffre) {
                return res.status(404).render("404", { title: "Appel d'offres introuvable" });
            }

            const [offres, checklist, documents] = await Promise.all([
                Offre.getByAppelOffre(id_ao),
                Checklist.getByAppelOffre(id_ao),
                Document.getByAppelOffre(id_ao),
            ]);

            res.render("appels_offres/detail", {
                title: appelOffre.numero_ao,
                appelOffre,
                offres,
                checklist,
                documents,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement de l'appel d'offres." });
        }
    },

    // GET /appels-offres/new
    async showCreateForm(req, res) {
        try {
            const categories = await Referentiel.getByType("CATEGORIE_AO");
            const etats = await Referentiel.getByType("ETAT_AO");

            res.render("appels_offres/form", {
                title: "Nouvel appel d'offres",
                appelOffre: null,
                categories,
                etats,
                error: null,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement du formulaire." });
        }
    },

    // GET /appels-offres/:id/edit
    async showEditForm(req, res) {
        try {
            const appelOffre = await AppelOffre.getById(req.params.id);

            if (!appelOffre) {
                return res.status(404).render("404", { title: "Appel d'offres introuvable" });
            }

            const categories = await Referentiel.getByType("CATEGORIE_AO");
            const etats = await Referentiel.getByType("ETAT_AO");

            res.render("appels_offres/form", {
                title: "Modifier l'appel d'offres",
                appelOffre,
                categories,
                etats,
                error: null,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement du formulaire." });
        }
    },

    // POST /appels-offres
    async create(req, res) {
        const {
            numero_ao, objet, categorie_id, etat_id, montant_estimatif,
            date_lancement, date_limite_depot, date_ouverture_plis, observation,
        } = req.body;

        if (!numero_ao || !objet || !categorie_id || !etat_id || !montant_estimatif) {
            const categories = await Referentiel.getByType("CATEGORIE_AO");
            const etats = await Referentiel.getByType("ETAT_AO");
            return res.render("appels_offres/form", {
                title: "Nouvel appel d'offres",
                appelOffre: req.body,
                categories,
                etats,
                error: "Numéro, objet, catégorie, état et montant estimatif sont obligatoires.",
            });
        }

        try {
            const id_ao = await AppelOffre.create({
                numero_ao,
                objet,
                categorie_id,
                etat_id,
                montant_estimatif,
                date_lancement,
                date_limite_depot,
                date_ouverture_plis,
                date_attribution: null,
                fournisseur_attributaire_id: null,
                observation,
            });

            // auto-init checklist: one TODO row per active ETAPE_CHECKLIST referentiel
            const todoStatuts = await Referentiel.getByType("STATUT_CHECKLIST");
            const todoStatut = todoStatuts.find(s => s.code === "TODO");

            if (todoStatut) {
                await Checklist.initForEntity("AO", id_ao, "ETAPE_CHECKLIST", todoStatut.id_ref);
            }

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "INSERT",
                entite_type: "APPEL_OFFRE",
                entite_id: id_ao,
                details: `Création de l'appel d'offres ${numero_ao}`,
            });

            res.redirect(`/appels-offres/${id_ao}`);
        } catch (err) {
            console.error(err);

            const error = err.code === "ER_DUP_ENTRY"
                ? "Un appel d'offres avec ce numéro existe déjà."
                : "Erreur lors de la création de l'appel d'offres.";

            const categories = await Referentiel.getByType("CATEGORIE_AO");
            const etats = await Referentiel.getByType("ETAT_AO");
            res.render("appels_offres/form", {
                title: "Nouvel appel d'offres",
                appelOffre: req.body,
                categories,
                etats,
                error,
            });
        }
    },

    // POST /appels-offres/:id — general edit (not for status/attribution changes)
    async update(req, res) {
        const id_ao = req.params.id;
        const {
            numero_ao, objet, categorie_id, etat_id, montant_estimatif,
            date_lancement, date_limite_depot, date_ouverture_plis, observation,
        } = req.body;

        try {
            const before = await AppelOffre.getById(id_ao);
            if (!before) {
                return res.status(404).render("404", { title: "Appel d'offres introuvable" });
            }

            await AppelOffre.update(id_ao, {
                numero_ao,
                objet,
                categorie_id,
                etat_id,
                montant_estimatif,
                date_lancement,
                date_limite_depot,
                date_ouverture_plis,
                date_attribution: before.date_attribution,
                fournisseur_attributaire_id: before.fournisseur_attributaire_id,
                observation,
            });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPDATE",
                entite_type: "APPEL_OFFRE",
                entite_id: id_ao,
                champ_modifie: "multiple",
                ancienne_valeur: JSON.stringify(before),
                nouvelle_valeur: JSON.stringify(req.body),
            });

            res.redirect(`/appels-offres/${id_ao}`);
        } catch (err) {
            console.error(err);

            const error = err.code === "ER_DUP_ENTRY"
                ? "Un appel d'offres avec ce numéro existe déjà."
                : "Erreur lors de la modification de l'appel d'offres.";

            const categories = await Referentiel.getByType("CATEGORIE_AO");
            const etats = await Referentiel.getByType("ETAT_AO");
            res.render("appels_offres/form", {
                title: "Modifier l'appel d'offres",
                appelOffre: { id_ao, numero_ao, objet, categorie_id, etat_id, montant_estimatif, date_lancement, date_limite_depot, date_ouverture_plis, observation },
                categories,
                etats,
                error,
            });
        }
    },

    // POST /appels-offres/:id/attribuer — dedicated business action: assign winning fournisseur
    async attribuer(req, res) {
        const id_ao = req.params.id;
        const { fournisseur_attributaire_id, date_attribution } = req.body;

        if (!fournisseur_attributaire_id || !date_attribution) {
            return res.status(400).render("errors/500", { message: "Fournisseur et date d'attribution sont obligatoires." });
        }

        try {
            const before = await AppelOffre.getById(id_ao);
            if (!before) {
                return res.status(404).render("404", { title: "Appel d'offres introuvable" });
            }

            const fournisseur = await Fournisseur.getById(fournisseur_attributaire_id);
            if (!fournisseur) {
                return res.status(400).render("errors/500", { message: "Fournisseur introuvable." });
            }

            // move état to ATTRIBUE
            const etats = await Referentiel.getByType("ETAT_AO");
            const etatAttribue = etats.find(e => e.code === "ATTRIBUE");

            await AppelOffre.update(id_ao, {
                numero_ao: before.numero_ao,
                objet: before.objet,
                categorie_id: before.categorie_id,
                etat_id: etatAttribue ? etatAttribue.id_ref : before.etat_id,
                montant_estimatif: before.montant_estimatif,
                date_lancement: before.date_lancement,
                date_limite_depot: before.date_limite_depot,
                date_ouverture_plis: before.date_ouverture_plis,
                date_attribution,
                fournisseur_attributaire_id,
                observation: before.observation,
            });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPDATE",
                entite_type: "APPEL_OFFRE",
                entite_id: id_ao,
                champ_modifie: "attribution",
                ancienne_valeur: before.fournisseur_attributaire_id ? String(before.fournisseur_attributaire_id) : null,
                nouvelle_valeur: String(fournisseur_attributaire_id),
                details: `Attribution à ${fournisseur.raison_sociale}`,
            });

            res.redirect(`/appels-offres/${id_ao}`);
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors de l'attribution." });
        }
    },

    // POST /appels-offres/:id/statut — quick état change without full form
    async updateStatut(req, res) {
        const id_ao = req.params.id;
        const { etat_id } = req.body;

        try {
            const before = await AppelOffre.getById(id_ao);
            if (!before) {
                return res.status(404).render("404", { title: "Appel d'offres introuvable" });
            }

            await AppelOffre.update(id_ao, {
                ...before,
                etat_id,
            });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPDATE",
                entite_type: "APPEL_OFFRE",
                entite_id: id_ao,
                champ_modifie: "etat_id",
                ancienne_valeur: String(before.etat_id),
                nouvelle_valeur: String(etat_id),
            });

            res.redirect(`/appels-offres/${id_ao}`);
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du changement de statut." });
        }
    },
};

module.exports = appelOffreController;