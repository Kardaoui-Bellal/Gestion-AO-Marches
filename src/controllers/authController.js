const bcrypt = require("bcrypt");
const Utilisateur = require("../models/utilisateurModel");
const Referentiel = require("../models/referentielModel");
const Historique = require("../models/historiqueModel");

const authController = {
    showLogin(req, res) {
        res.render("auth/login", { error: null });
    },

    async login(req, res) {
        const { email, mot_de_passe } = req.body;

        try {
            const user = await Utilisateur.findByEmail(email);

            if (!user || !user.actif) {
                return res.render("auth/login", { error: "Identifiants invalides." });
            }

            const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);
            if (!match) {
                return res.render("auth/login", { error: "Identifiants invalides." });
            }

            const role = await Referentiel.getById(user.profil_id);

            req.session.user = {
                id_utilisateur: user.id_utilisateur,
                nom: user.nom,
                email: user.email,
                role_code: role.code, // 'ADMIN' | 'GESTIONNAIRE' | 'CONSULTANT'
                role_libelle: role.libelle,
            };

            await Historique.log({
                utilisateur_id: user.id_utilisateur,
                action: "INSERT",
                entite_type: "SESSION",
                entite_id: user.id_utilisateur,
                details: "Connexion utilisateur",
            });

            return res.redirect("/dashboard");
        } catch (err) {
            console.error(err);
            return res.render("auth/login", { error: "Une erreur est survenue." });
        }
    },

    logout(req, res) {
        req.session.destroy(() => {
            res.clearCookie("ao_marches_sid");
            res.redirect("/auth/login");
        });
    },
};

module.exports = authController;