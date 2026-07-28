const path = require("path");
const fs = require("fs");
const Document = require("../models/documentModel");
const AppelOffre = require("../models/appelOffreModel");
const Marche = require("../models/marcheModel");
const Referentiel = require("../models/referentielModel");
const Historique = require("../models/historiqueModel");

const documentController = {
    // GET /documents — "Pièces jointes" : tous les documents, toutes entités confondues
    async list(req, res) {
        try {
            const documents = await Document.getAll();

            res.render("documents/liste", {
                title: "Pièces jointes",
                documents,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement des pièces jointes." });
        }
    },

    // GET /documents/upload?type_entite=AO&entite_id=12 — upload form
    async showUploadForm(req, res) {
        try {
            const { type_entite, entite_id } = req.query;

            if (!["AO", "MARCHE"].includes(type_entite) || !entite_id) {
                return res.status(400).render("errors/500", { message: "Paramètres manquants ou invalides." });
            }

            const entite = type_entite === "AO"
                ? await AppelOffre.getById(entite_id)
                : await Marche.getById(entite_id);

            if (!entite) {
                return res.status(404).render("404", { title: "Entité introuvable" });
            }

            const typesDocument = await Referentiel.getByType("TYPE_DOCUMENT");

            res.render("documents/upload", {
                title: "Ajouter un document",
                type_entite,
                entite_id,
                entite,
                typesDocument,
                error: null,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du chargement du formulaire." });
        }
    },

    // POST /documents/upload — multer middleware runs before this in the route chain
    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).render("errors/500", { message: "Aucun fichier reçu." });
            }

            const { type_entite, entite_id, type_document_id, observation } = req.body;

            if (!type_entite || !entite_id || !type_document_id) {
                // clean up the orphaned file since we're rejecting the request
                fs.unlink(req.file.path, () => {});
                return res.status(400).render("errors/500", { message: "Champs obligatoires manquants." });
            }

            const relativeFolder = type_entite === "AO" ? "uploads/ao" : "uploads/marches";

            const id_document = await Document.create({
                type_entite,
                entite_id,
                type_document_id,
                nom_original: req.file.originalname,
                nom_stocke: req.file.filename,
                chemin_dossier: relativeFolder,
                taille: req.file.size,
                mime_type: req.file.mimetype,
                observation,
            });

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPLOAD",
                entite_type: type_entite === "AO" ? "APPEL_OFFRE" : "MARCHE",
                entite_id,
                details: `Ajout du document "${req.file.originalname}"`,
            });

            if (type_entite === "AO") {
                return res.redirect(`/appels-offres/${entite_id}`);
            }
            return res.redirect(`/marches/${entite_id}`);
        } catch (err) {
            console.error(err);

            // clean up the uploaded file if DB insert failed, to avoid orphaned files on disk
            if (req.file) fs.unlink(req.file.path, () => {});

            res.status(500).render("errors/500", { message: "Erreur lors de l'ajout du document." });
        }
    },

    // GET /documents/:id/download — stream the file back to the browser
    async download(req, res) {
        try {
            const document = await Document.getById(req.params.id);

            if (!document) {
                return res.status(404).render("404", { title: "Document introuvable" });
            }

            const filePath = path.join(__dirname, "../..", document.chemin_dossier, document.nom_stocke);

            if (!fs.existsSync(filePath)) {
                return res.status(404).render("errors/500", { message: "Le fichier n'existe plus sur le serveur." });
            }

            res.download(filePath, document.nom_original);
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors du téléchargement." });
        }
    },

    // POST /documents/:id/archive — soft-archive (keeps the row and file, just marks observation)
    async archive(req, res) {
        try {
            const document = await Document.getById(req.params.id);

            if (!document) {
                return res.status(404).render("404", { title: "Document introuvable" });
            }

            await Document.archive(req.params.id, req.body.observation || "Archivé");

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "ARCHIVE",
                entite_type: document.type_entite === "AO" ? "APPEL_OFFRE" : "MARCHE",
                entite_id: document.entite_id,
                details: `Archivage du document "${document.nom_original}"`,
            });

            if (document.type_entite === "AO") {
                return res.redirect(`/appels-offres/${document.entite_id}`);
            }
            return res.redirect(`/marches/${document.entite_id}`);
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors de l'archivage du document." });
        }
    },
};

module.exports = documentController;