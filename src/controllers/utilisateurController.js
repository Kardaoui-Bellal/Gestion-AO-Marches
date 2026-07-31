const bcrypt = require("bcrypt");
const Utilisateur = require("../models/utilisateurModel");
const Referentiel = require("../models/referentielModel");
const Historique = require("../models/historiqueModel");

const SALT_ROUNDS = 10;

const utilisateurController = {
    // GET /utilisateurs — list all, admin-only
    async list(req, res) {
        try {
            const utilisateurs = await Utilisateur.getAll();
            const roles = await Referentiel.getByType("ROLE");

            // attach readable role libellé to each user for display
            const roleMap = {};
            roles.forEach(r => { roleMap[r.id_ref] = r.libelle; });

            const utilisateursAvecRole = utilisateurs.map(u => ({
                ...u,
                role_libelle: roleMap[u.profil_id] || "—",
            }));

            res.render("utilisateurs/liste", {
                title: "Utilisateurs",
                utilisateurs: utilisateursAvecRole,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement des utilisateurs." });
        }
    },

    // GET /utilisateurs/new
    async showCreateForm(req, res) {
        try {
            const roles = await Referentiel.getByType("ROLE");

            res.render("utilisateurs/form", {
                title: "Nouvel utilisateur",
                utilisateur: null,
                roles,
                error: null,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement du formulaire." });
        }
    },

    // GET /utilisateurs/:id/edit
    async showEditForm(req, res) {
        try {
            const utilisateur = await Utilisateur.findById(req.params.id);

            if (!utilisateur) {
                return res.status(404).render("404", { title: "Utilisateur introuvable" });
            }

            const roles = await Referentiel.getByType("ROLE");

            res.render("utilisateurs/form", {
                title: "Modifier l'utilisateur",
                utilisateur,
                roles,
                error: null,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement du formulaire." });
        }
    },

    // POST /utilisateurs
    async create(req, res) {
        const { nom, email, mot_de_passe, mot_de_passe_confirm, profil_id } = req.body;

        if (!nom || !email || !mot_de_passe || !profil_id) {
            const roles = await Referentiel.getByType("ROLE");
            return res.render("utilisateurs/form", {
                title: "Nouvel utilisateur",
                utilisateur: req.body,
                roles,
                error: "Tous les champs sont obligatoires.",
            });
        }

        if (mot_de_passe !== mot_de_passe_confirm) {
            const roles = await Referentiel.getByType("ROLE");
            return res.render("utilisateurs/form", {
                title: "Nouvel utilisateur",
                utilisateur: req.body,
                roles,
                error: "Les mots de passe ne correspondent pas.",
            });
        }

        if (mot_de_passe.length < 8) {
            const roles = await Referentiel.getByType("ROLE");
            return res.render("utilisateurs/form", {
                title: "Nouvel utilisateur",
                utilisateur: req.body,
                roles,
                error: "Le mot de passe doit contenir au moins 8 caractères.",
            });
        }

        try {
            const existing = await Utilisateur.findByEmail(email);
            if (existing) {
                const roles = await Referentiel.getByType("ROLE");
                return res.render("utilisateurs/form", {
                    title: "Nouvel utilisateur",
                    utilisateur: req.body,
                    roles,
                    error: "Un utilisateur avec cet email existe déjà.",
                });
            }

            const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);

            const id_utilisateur = await Utilisateur.create({
                nom,
                email,
                mot_de_passe_hash,
                profil_id,
            });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "INSERT",
                entite_type: "UTILISATEUR",
                entite_id: id_utilisateur,
                details: `Création de l'utilisateur "${nom}" (${email})`,
            });

            res.redirect("/utilisateurs");
        } catch (err) {
            console.error(err);

            const error = err.code === "ER_DUP_ENTRY"
                ? "Un utilisateur avec cet email existe déjà."
                : "Erreur lors de la création de l'utilisateur.";

            const roles = await Referentiel.getByType("ROLE");
            res.render("utilisateurs/form", {
                title: "Nouvel utilisateur",
                utilisateur: req.body,
                roles,
                error,
            });
        }
    },

    // POST /utilisateurs/:id — edit nom/email/profil_id/actif
async update(req, res) {
    const id_utilisateur = req.params.id;
    const { nom, email, profil_id, actif } = req.body;

    try {
        const before = await Utilisateur.findById(id_utilisateur);
        if (!before) {
            return res.status(404).render("404", { title: "Utilisateur introuvable" });
        }

        // safety: prevent an admin from deactivating their own account by mistake
        if (String(id_utilisateur) === String(req.session.user.id_utilisateur) && !actif) {
            const roles = await Referentiel.getByType("ROLE");
            return res.render("utilisateurs/form", {
                title: "Modifier l'utilisateur",
                utilisateur: { ...before, nom, email, profil_id, actif },
                roles,
                error: "Vous ne pouvez pas désactiver votre propre compte.",
            });
        }

        // empêcher de changer vers un email déjà utilisé par un AUTRE compte
        if (email && email !== before.email) {
            const existing = await Utilisateur.findByEmail(email);
            if (existing && String(existing.id_utilisateur) !== String(id_utilisateur)) {
                const roles = await Referentiel.getByType("ROLE");
                return res.render("utilisateurs/form", {
                    title: "Modifier l'utilisateur",
                    utilisateur: { ...before, nom, email, profil_id, actif },
                    roles,
                    error: "Un utilisateur avec cet email existe déjà.",
                });
            }
        }

        await Utilisateur.update(id_utilisateur, {
            nom,
            email,
            profil_id,
            actif: actif ? 1 : 0,
        });

        const diff = buildDiff(before, { nom, profil_id, actif: actif ? 1 : 0 }, ["nom", "profil_id", "actif"]);

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPDATE",
                entite_type: "UTILISATEUR",
                entite_id: id_utilisateur,
                champ_modifie: diff ? diff.champ_modifie : null,
                ancienne_valeur: diff ? diff.ancienne_valeur : null,
                nouvelle_valeur: diff ? diff.nouvelle_valeur : null,
                details: diff ? null : "Aucune modification de champ détectée.",
            });

        res.redirect("/utilisateurs");
    } catch (err) {
        console.error(err);

        const error = err.code === "ER_DUP_ENTRY"
            ? "Un utilisateur avec cet email existe déjà."
            : "Erreur lors de la modification de l'utilisateur.";

        const roles = await Referentiel.getByType("ROLE");
        res.render("utilisateurs/form", {
            title: "Modifier l'utilisateur",
            utilisateur: { id_utilisateur, nom, email, profil_id, actif },
            roles,
            error,
        });
    }
},

    // GET /utilisateurs/:id/password — dedicated password change form
    async showChangePasswordForm(req, res) {
        try {
            const utilisateur = await Utilisateur.findById(req.params.id);

            if (!utilisateur) {
                return res.status(404).render("404", { title: "Utilisateur introuvable" });
            }

            res.render("utilisateurs/password", {
                title: "Changer le mot de passe",
                utilisateur,
                error: null,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement du formulaire." });
        }
    },

    // POST /utilisateurs/:id/password
    async changePassword(req, res) {
        const id_utilisateur = req.params.id;
        const { nouveau_mot_de_passe, nouveau_mot_de_passe_confirm } = req.body;

        try {
            const utilisateur = await Utilisateur.findById(id_utilisateur);
            if (!utilisateur) {
                return res.status(404).render("404", { title: "Utilisateur introuvable" });
            }

            if (!nouveau_mot_de_passe || nouveau_mot_de_passe.length < 8) {
                return res.render("utilisateurs/password", {
                    title: "Changer le mot de passe",
                    utilisateur,
                    error: "Le mot de passe doit contenir au moins 8 caractères.",
                });
            }

            if (nouveau_mot_de_passe !== nouveau_mot_de_passe_confirm) {
                return res.render("utilisateurs/password", {
                    title: "Changer le mot de passe",
                    utilisateur,
                    error: "Les mots de passe ne correspondent pas.",
                });
            }

            const hash = await bcrypt.hash(nouveau_mot_de_passe, SALT_ROUNDS);
            await Utilisateur.updatePassword(id_utilisateur, hash);

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPDATE",
                entite_type: "UTILISATEUR",
                entite_id: id_utilisateur,
                champ_modifie: "mot_de_passe_hash",
                details: `Changement de mot de passe pour "${utilisateur.nom}"`,
            });

            res.redirect("/utilisateurs");
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du changement de mot de passe." });
        }
    },
};

module.exports = utilisateurController;