const Referentiel = require("../models/referentielModel");
const Historique = require("../models/historiqueModel");

const referentielController = {
    // GET /referentiels — list all, grouped by type_referentiel for the admin UI
    async list(req, res) {
        try {
            const all = await Referentiel.getAll();

            // group by type_referentiel so the view can render one section per type
            const grouped = all.reduce((acc, ref) => {
                if (!acc[ref.type_referentiel]) acc[ref.type_referentiel] = [];
                acc[ref.type_referentiel].push(ref);
                return acc;
            }, {});

            res.render("referentiels/liste", {
                title: "Référentiels",
                grouped,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement des référentiels." });
        }
    },

    // GET /referentiels/new — blank creation form
    showCreateForm(req, res) {
        res.render("referentiels/form", {
            title: "Nouveau référentiel",
            referentiel: null,
            error: null,
        });
    },

    // GET /referentiels/:id/edit
    async showEditForm(req, res) {
        try {
            const referentiel = await Referentiel.getById(req.params.id);

            if (!referentiel) {
                return res.status(404).render("404", { title: "Référentiel introuvable" });
            }

            res.render("referentiels/form", {
                title: "Modifier le référentiel",
                referentiel,
                error: null,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement du référentiel." });
        }
    },

    // POST /referentiels
    async create(req, res) {
        const { type_referentiel, code, libelle, ordre_affichage } = req.body;

        if (!type_referentiel || !code || !libelle) {
            return res.render("referentiels/form", {
                title: "Nouveau référentiel",
                referentiel: req.body,
                error: "Le type, le code et le libellé sont obligatoires.",
            });
        }

        try {
            const id_ref = await Referentiel.create({
                type_referentiel,
                code,
                libelle,
                ordre_affichage,
            });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "INSERT",
                entite_type: "REFERENTIEL",
                entite_id: id_ref,
                details: `Création du référentiel ${type_referentiel}/${code}`,
            });

            res.redirect("/referentiels");
        } catch (err) {
            console.error(err);

            // duplicate (type_referentiel, code) unique key violation
            const error = err.code === "ER_DUP_ENTRY"
                ? "Ce code existe déjà pour ce type de référentiel."
                : "Erreur lors de la création du référentiel.";

            res.render("referentiels/form", {
                title: "Nouveau référentiel",
                referentiel: req.body,
                error,
            });
        }
    },

    // POST /referentiels/:id
    async update(req, res) {
        const { code, libelle, ordre_affichage, actif } = req.body;
        const id_ref = req.params.id;

        try {
            const before = await Referentiel.getById(id_ref);

            if (!before) {
                return res.status(404).render("404", { title: "Référentiel introuvable" });
            }

            await Referentiel.update(id_ref, {
                code,
                libelle,
                ordre_affichage,
                actif: actif ? 1 : 0, // checkbox sends 'on' or nothing
            });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPDATE",
                entite_type: "REFERENTIEL",
                entite_id: id_ref,
                champ_modifie: "multiple",
                ancienne_valeur: JSON.stringify(before),
                nouvelle_valeur: JSON.stringify({ code, libelle, ordre_affichage, actif: !!actif }),
            });

            res.redirect("/referentiels");
        } catch (err) {
            console.error(err);

            const error = err.code === "ER_DUP_ENTRY"
                ? "Ce code existe déjà pour ce type de référentiel."
                : "Erreur lors de la modification du référentiel.";

            res.render("referentiels/form", {
                title: "Modifier le référentiel",
                referentiel: { id_ref, code, libelle, ordre_affichage, actif },
                error,
            });
        }
    },

    // POST /referentiels/:id/toggle — quick activate/deactivate without opening the form
    async toggleActif(req, res) {
        try {
            const referentiel = await Referentiel.getById(req.params.id);

            if (!referentiel) {
                return res.status(404).render("404", { title: "Référentiel introuvable" });
            }

            const newActif = referentiel.actif ? 0 : 1;

            await Referentiel.update(req.params.id, {
                code: referentiel.code,
                libelle: referentiel.libelle,
                ordre_affichage: referentiel.ordre_affichage,
                actif: newActif,
            });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPDATE",
                entite_type: "REFERENTIEL",
                entite_id: req.params.id,
                champ_modifie: "actif",
                ancienne_valeur: String(referentiel.actif),
                nouvelle_valeur: String(newActif),
            });

            res.redirect("/referentiels");
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du changement de statut." });
        }
    },
};

module.exports = referentielController;