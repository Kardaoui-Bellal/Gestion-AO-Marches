const Checklist = require("../models/checklistModel");
const Referentiel = require("../models/referentielModel");
const Historique = require("../models/historiqueModel");

const checklistController = {
    // GET /appels-offres/:aoId/checklist or /marches/:marcheId/checklist
    // (typically embedded inline in the AO/Marché detail page rather than a standalone route,
    // but exposed here in case you want a dedicated full-page checklist view)
    async detail(req, res) {
        try {
            const { type_entite, id } = req.params;

            if (!["AO", "MARCHE"].includes(type_entite)) {
                return res.status(400).render("errors/500", { message: "Type d'entité invalide." });
            }

            const checklist = await Checklist.getByEntity(type_entite, id);

            res.render("checklist/detail", {
                title: "Checklist",
                type_entite,
                entite_id: id,
                checklist,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement de la checklist." });
        }
    },

    // POST /checklist/:id — update one étape's statut/date_validation/observation
    async update(req, res) {
        const id_checklist = req.params.id;
        const { statut_id, date_validation, observation } = req.body;

        try {
            const before = await Checklist.getById(id_checklist);
            if (!before) {
                return res.status(404).render("404", { title: "Étape de checklist introuvable" });
            }

            // if marking as DONE and no date given, default to today
            const statuts = await Referentiel.getByType("STATUT_CHECKLIST");
            const nouveauStatut = statuts.find(s => s.id_ref == statut_id);

            let finalDateValidation = date_validation;
            if (nouveauStatut && nouveauStatut.code === "DONE" && !date_validation) {
                finalDateValidation = new Date().toISOString().split("T")[0];
            }

            await Checklist.update(id_checklist, {
                statut_id,
                date_validation: finalDateValidation,
                observation,
            });

            const entiteType = before.type_entite === "AO" ? "APPEL_OFFRE" : "MARCHE";
            const entiteId = before.type_entite === "AO" ? before.appel_offre_id : before.marche_id;

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPDATE",
                entite_type: "CHECKLIST",
                entite_id: id_checklist,
                champ_modifie: "statut_id",
                ancienne_valeur: before.statut_libelle,
                nouvelle_valeur: nouveauStatut ? nouveauStatut.libelle : String(statut_id),
                details: `Étape "${before.etape_libelle}" — ${entiteType} #${entiteId}`,
            });

            // redirect back to whichever parent entity this checklist row belongs to
            if (before.type_entite === "AO") {
                return res.redirect(`/appels-offres/${before.appel_offre_id}`);
            }
            return res.redirect(`/marches/${before.marche_id}`);
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors de la mise à jour de la checklist." });
        }
    },
};

module.exports = checklistController;