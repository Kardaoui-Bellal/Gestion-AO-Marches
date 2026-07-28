const Fournisseur = require("../models/fournisseurModel");
const Referentiel = require("../models/referentielModel");
const Historique = require("../models/historiqueModel");

const fournisseurController = {
    // GET /fournisseurs — list all, with domaine_activite dropdown for filtering
    async list(req, res) {
        try {
            const { domaine_activite_id } = req.query;

            const fournisseurs = domaine_activite_id
                ? await Fournisseur.getByDomaine(domaine_activite_id)
                : await Fournisseur.getAll();

            const domaines = await Referentiel.getByType("DOMAINE_ACTIVITE");

            res.render("fournisseurs/liste", {
                title: "Fournisseurs",
                fournisseurs,
                domaines,
                selectedDomaine: domaine_activite_id || "",
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement des fournisseurs." });
        }
    },

    // GET /fournisseurs/:id
    async detail(req, res) {
        try {
            const fournisseur = await Fournisseur.getById(req.params.id);

            if (!fournisseur) {
                return res.status(404).render("404", { title: "Fournisseur introuvable" });
            }

            res.render("fournisseurs/detail", {
                title: fournisseur.raison_sociale,
                fournisseur,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement du fournisseur." });
        }
    },

    // GET /fournisseurs/new
    async showCreateForm(req, res) {
        try {
            const domaines = await Referentiel.getByType("DOMAINE_ACTIVITE");

            res.render("fournisseurs/form", {
                title: "Nouveau fournisseur",
                fournisseur: null,
                domaines,
                error: null,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement du formulaire." });
        }
    },

    // GET /fournisseurs/:id/edit
    async showEditForm(req, res) {
        try {
            const fournisseur = await Fournisseur.getById(req.params.id);

            if (!fournisseur) {
                return res.status(404).render("404", { title: "Fournisseur introuvable" });
            }

            const domaines = await Referentiel.getByType("DOMAINE_ACTIVITE");

            res.render("fournisseurs/form", {
                title: "Modifier le fournisseur",
                fournisseur,
                domaines,
                error: null,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement du formulaire." });
        }
    },

    // POST /fournisseurs
    async create(req, res) {
        const { raison_sociale, ice, adresse, telephone, email, contact, domaine_activite_id } = req.body;

        if (!raison_sociale || !ice || !domaine_activite_id) {
            const domaines = await Referentiel.getByType("DOMAINE_ACTIVITE");
            return res.render("fournisseurs/form", {
                title: "Nouveau fournisseur",
                fournisseur: req.body,
                domaines,
                error: "La raison sociale, l'ICE et le domaine d'activité sont obligatoires.",
            });
        }

        try {
            const id_fournisseur = await Fournisseur.create({
                raison_sociale,
                ice,
                adresse,
                telephone,
                email,
                contact,
                domaine_activite_id,
                actif: 1,
            });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "INSERT",
                entite_type: "FOURNISSEUR",
                entite_id: id_fournisseur,
                details: `Création du fournisseur "${raison_sociale}" (ICE: ${ice})`,
            });

            res.redirect(`/fournisseurs/${id_fournisseur}`);
        } catch (err) {
            console.error(err);

            const error = err.code === "ER_DUP_ENTRY"
                ? "Un fournisseur avec cet ICE existe déjà."
                : "Erreur lors de la création du fournisseur.";

            const domaines = await Referentiel.getByType("DOMAINE_ACTIVITE");
            res.render("fournisseurs/form", {
                title: "Nouveau fournisseur",
                fournisseur: req.body,
                domaines,
                error,
            });
        }
    },

    // POST /fournisseurs/:id
    async update(req, res) {
        const id_fournisseur = req.params.id;
        const { raison_sociale, ice, adresse, telephone, email, contact, domaine_activite_id, actif } = req.body;

        try {
            const before = await Fournisseur.getById(id_fournisseur);

            if (!before) {
                return res.status(404).render("404", { title: "Fournisseur introuvable" });
            }

            await Fournisseur.update(id_fournisseur, {
                raison_sociale,
                ice,
                adresse,
                telephone,
                email,
                contact,
                domaine_activite_id,
                actif: actif ? 1 : 0,
            });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPDATE",
                entite_type: "FOURNISSEUR",
                entite_id: id_fournisseur,
                champ_modifie: "multiple",
                ancienne_valeur: JSON.stringify(before),
                nouvelle_valeur: JSON.stringify(req.body),
            });

            res.redirect(`/fournisseurs/${id_fournisseur}`);
        } catch (err) {
            console.error(err);

            const error = err.code === "ER_DUP_ENTRY"
                ? "Un fournisseur avec cet ICE existe déjà."
                : "Erreur lors de la modification du fournisseur.";

            const domaines = await Referentiel.getByType("DOMAINE_ACTIVITE");
            res.render("fournisseurs/form", {
                title: "Modifier le fournisseur",
                fournisseur: { id_fournisseur, raison_sociale, ice, adresse, telephone, email, contact, domaine_activite_id, actif },
                domaines,
                error,
            });
        }
    },

    // POST /fournisseurs/:id/toggle — activer/désactiver rapidement, sans passer
    // par le formulaire complet (bouton "Désactiver/Réactiver" sur liste et detail)
    async toggleActif(req, res) {
        try {
            const fournisseur = await Fournisseur.getById(req.params.id);

            if (!fournisseur) {
                return res.status(404).render("404", { title: "Fournisseur introuvable" });
            }

            const newActif = fournisseur.actif ? 0 : 1;

            await Fournisseur.update(req.params.id, {
                raison_sociale: fournisseur.raison_sociale,
                ice: fournisseur.ice,
                adresse: fournisseur.adresse,
                telephone: fournisseur.telephone,
                email: fournisseur.email,
                contact: fournisseur.contact,
                domaine_activite_id: fournisseur.domaine_activite_id,
                actif: newActif,
            });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPDATE",
                entite_type: "FOURNISSEUR",
                entite_id: req.params.id,
                champ_modifie: "actif",
                ancienne_valeur: String(fournisseur.actif),
                nouvelle_valeur: String(newActif),
                details: `${newActif ? "Réactivation" : "Désactivation"} du fournisseur "${fournisseur.raison_sociale}"`,
            });

            res.redirect(req.get("Referer") || "/fournisseurs");
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du changement de statut." });
        }
    },

    // GET /fournisseurs/search?ice=XXXX — used for AJAX lookup or a search form
    async searchByIce(req, res) {
        try {
            const { ice } = req.query;

            if (!ice) {
                return res.status(400).json({ error: "Paramètre ICE manquant." });
            }

            const fournisseur = await Fournisseur.getByIce(ice);

            if (!fournisseur) {
                return res.status(404).json({ error: "Aucun fournisseur trouvé pour cet ICE." });
            }

            res.json(fournisseur);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur lors de la recherche." });
        }
    },
};

module.exports = fournisseurController;