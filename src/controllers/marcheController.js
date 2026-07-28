const path = require("path");
const fs = require("fs");
const Marche = require("../models/marcheModel");
const Checklist = require("../models/checklistModel");
const Document = require("../models/documentModel");
const Fournisseur = require("../models/fournisseurModel");
const AppelOffre = require("../models/appelOffreModel");
const Referentiel = require("../models/referentielModel");
const Historique = require("../models/historiqueModel");

const marcheController = {
  // GET /marches — list with optional filters
  async list(req, res) {
    try {
      const { type_marche_id, statut_id, is_inactive } = req.query;

      const filters = { type_marche_id, statut_id };
      if (is_inactive === "true") filters.is_inactive = true;
      if (is_inactive === "false") filters.is_inactive = false;

      const marches = await Marche.getByFilters(filters);
      const types = await Referentiel.getByType("TYPE_MARCHE");
      const statuts = await Referentiel.getByType("STATUT_MARCHE");

      res.render("marches/liste", {
        title: "Marchés",
        marches,
        types,
        statuts,
        filters: {
          type_marche_id: type_marche_id || "",
          statut_id: statut_id || "",
          is_inactive: is_inactive || "",
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("errors/500", {
        message: "Erreur lors du chargement des marchés.",
      });
    }
  },

  // GET /marches/:id — full detail: checklist, documents
  async detail(req, res) {
    try {
      const id_marche = req.params.id;

      const marche = await Marche.getById(id_marche);
      if (!marche) {
        return res.status(404).render("404", { title: "Marché introuvable" });
      }

      const [checklist, documents] = await Promise.all([
        Checklist.getByMarche(id_marche),
        Document.getByMarche(id_marche),
      ]);

      res.render("marches/detail", {
        title: marche.numero,
        marche,
        checklist,
        documents,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("errors/500", {
        message: "Erreur lors du chargement du marché.",
      });
    }
  },

  // GET /marches/new — optionally pre-filled from an attributed AO via ?appel_offre_id=
  async showCreateForm(req, res) {
    try {
      const { appel_offre_id } = req.query;

      let appelOffre = null;
      if (appel_offre_id) {
        appelOffre = await AppelOffre.getById(appel_offre_id);
      }

      const fournisseurs = await Fournisseur.getAll();
      const types = await Referentiel.getByType("TYPE_MARCHE");
      const statuts = await Referentiel.getByType("STATUT_MARCHE");

      // --- ADDED ---
      const etats = await Referentiel.getByType("ETAT_AO");
      const etatAttribue = etats.find((e) => e.code === "ATTRIBUE");
      const appelsOffres = etatAttribue
        ? await AppelOffre.getByFilters({ etat_id: etatAttribue.id_ref })
        : [];
      const typesDocument = await Referentiel.getByType("TYPE_DOCUMENT");
      // --- END ADDED ---

      res.render("marches/form", {
        title: "Nouveau marché",
        marche: null,
        appelOffre,
        fournisseurs,
        types,
        statuts,
        appelsOffres, // ADDED
        typesDocument, // ADDED
        error: null,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("errors/500", {
        message: "Erreur lors du chargement du formulaire.",
      });
    }
  },

  // GET /marches/:id/edit
  async showEditForm(req, res) {
    try {
      const marche = await Marche.getById(req.params.id);
      if (!marche) {
        return res.status(404).render("404", { title: "Marché introuvable" });
      }

      const fournisseurs = await Fournisseur.getAll();
      const types = await Referentiel.getByType("TYPE_MARCHE");
      const statuts = await Referentiel.getByType("STATUT_MARCHE");

      // --- ADDED ---
      const etats = await Referentiel.getByType("ETAT_AO");
      const etatAttribue = etats.find((e) => e.code === "ATTRIBUE");
      const appelsOffres = etatAttribue
        ? await AppelOffre.getByFilters({ etat_id: etatAttribue.id_ref })
        : [];
      const typesDocument = await Referentiel.getByType("TYPE_DOCUMENT");
      const documents = await Document.getByMarche(req.params.id);
      // --- END ADDED ---

      res.render("marches/form", {
        title: "Modifier le marché",
        marche,
        appelOffre: null,
        fournisseurs,
        types,
        statuts,
        appelsOffres, // ADDED
        typesDocument, // ADDED
        documents, // ADDED — so existing attachments show up
        error: null,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("errors/500", {
        message: "Erreur lors du chargement du formulaire.",
      });
    }
  },

  // POST /marches
  async create(req, res) {
    const {
      numero,
      objet,
      type_marche_id,
      statut_id,
      fournisseur_id,
      appel_offre_id,
      montant,
      date_notification,
      date_debut,
      date_fin,
      delai_execution_jours,
      date_prochaine_echeance,
      observation,
    } = req.body;

    if (
      !numero ||
      !objet ||
      !type_marche_id ||
      !statut_id ||
      !fournisseur_id ||
      !montant
    ) {
      const fournisseurs = await Fournisseur.getAll();
      const types = await Referentiel.getByType("TYPE_MARCHE");
      const statuts = await Referentiel.getByType("STATUT_MARCHE");
      const etats = await Referentiel.getByType("ETAT_AO");
      const etatAttribue = etats.find((e) => e.code === "ATTRIBUE");
      const appelsOffres = etatAttribue
        ? await AppelOffre.getByFilters({ etat_id: etatAttribue.id_ref })
        : [];
      const typesDocument = await Referentiel.getByType("TYPE_DOCUMENT");
      return res.render("marches/form", {
        title: "Nouveau marché",
        marche: req.body,
        appelOffre: null,
        fournisseurs,
        types,
        statuts,
        error:
          "Numéro, objet, type, statut, fournisseur et montant sont obligatoires.",
      });
    }

    try {
      const id_marche = await Marche.create({
        numero,
        objet,
        type_marche_id,
        statut_id,
        fournisseur_id,
        appel_offre_id: appel_offre_id || null,
        montant,
        date_notification,
        date_debut,
        date_fin,
        delai_execution_jours,
        date_reception_provisoire: null,
        date_reception_definitive: null,
        date_prochaine_echeance,
        observation,
      });

      // auto-init checklist: one TODO row per active ETAPE_CHECKLIST referentiel
      const todoStatuts = await Referentiel.getByType("STATUT_CHECKLIST");
      const todoStatut = todoStatuts.find((s) => s.code === "TODO");

      if (todoStatut) {
        await Checklist.initForEntity(
          "MARCHE",
          id_marche,
          "ETAPE_CHECKLIST",
          todoStatut.id_ref,
        );
      }

      await Historique.log({
        utilisateur_id: req.session.user.id_utilisateur,
        action: "INSERT",
        entite_type: "MARCHE",
        entite_id: id_marche,
        details: `Création du marché ${numero}`,
      });

      res.redirect(`/marches/${id_marche}`);
    } catch (err) {
      console.error(err);

      const error =
        err.code === "ER_DUP_ENTRY"
          ? "Un marché avec ce numéro existe déjà."
          : "Erreur lors de la création du marché.";

      const fournisseurs = await Fournisseur.getAll();
      const types = await Referentiel.getByType("TYPE_MARCHE");
      const statuts = await Referentiel.getByType("STATUT_MARCHE");
      res.render("marches/form", {
        title: "Nouveau marché",
        marche: req.body,
        appelOffre: null,
        fournisseurs,
        types,
        statuts,
        error,
      });
    }
  },

  // POST /marches/:id — general edit (not for status changes)
  async update(req, res) {
    const id_marche = req.params.id;
    const {
      numero,
      objet,
      type_marche_id,
      statut_id,
      fournisseur_id,
      appel_offre_id,
      montant,
      date_notification,
      date_debut,
      date_fin,
      delai_execution_jours,
      date_reception_provisoire,
      date_reception_definitive,
      date_prochaine_echeance,
      observation,
    } = req.body;

    try {
      const before = await Marche.getById(id_marche);
      if (!before) {
        return res.status(404).render("404", { title: "Marché introuvable" });
      }

      await Marche.update(id_marche, {
        numero,
        objet,
        type_marche_id,
        statut_id: before.statut_id, // status changes go through updateStatus()
        fournisseur_id,
        appel_offre_id: appel_offre_id || before.appel_offre_id,
        montant,
        date_notification,
        date_debut,
        date_fin,
        delai_execution_jours,
        date_reception_provisoire:
          date_reception_provisoire || before.date_reception_provisoire,
        date_reception_definitive:
          date_reception_definitive || before.date_reception_definitive,
        date_prochaine_echeance,
        observation,
      });

      await Historique.log({
        utilisateur_id: req.session.user.id_utilisateur,
        action: "UPDATE",
        entite_type: "MARCHE",
        entite_id: id_marche,
        champ_modifie: "multiple",
        ancienne_valeur: JSON.stringify(before),
        nouvelle_valeur: JSON.stringify(req.body),
      });

      res.redirect(`/marches/${id_marche}`);
    } catch (err) {
      console.error(err);
      res.status(500).render("errors/500", {
        message: "Erreur lors de la modification du marché.",
      });
    }
  },

  // POST /marches/:id/statut — dedicated status transition
  async updateStatus(req, res) {
    const id_marche = req.params.id;
    const { statut_id } = req.body;

    try {
      const before = await Marche.getById(id_marche);
      if (!before) {
        return res.status(404).render("404", { title: "Marché introuvable" });
      }

      await Marche.updateStatus(id_marche, statut_id);

      const statuts = await Referentiel.getByType("STATUT_MARCHE");
      const nouveauStatut = statuts.find((s) => s.id_ref == statut_id);

      await Historique.log({
        utilisateur_id: req.session.user.id_utilisateur,
        action: "UPDATE",
        entite_type: "MARCHE",
        entite_id: id_marche,
        champ_modifie: "statut_id",
        ancienne_valeur: before.statut_libelle,
        nouvelle_valeur: nouveauStatut
          ? nouveauStatut.libelle
          : String(statut_id),
      });

      res.redirect(`/marches/${id_marche}`);
    } catch (err) {
      console.error(err);
      res.status(500).render("errors/500", {
        message: "Erreur lors du changement de statut.",
      });
    }
  },

  // GET /marches/:id/fiche — printable HTML fiche (the PDF version lives at
  // /export/marches/:id/fiche via exportController.marcheFiche). This is the
  // page the "Voir la fiche" button on marches/detail.ejs links to.
  async ficheView(req, res) {
    try {
      const id_marche = req.params.id;

      const marche = await Marche.getById(id_marche);
      if (!marche) {
        return res.status(404).render("404", { title: "Marché introuvable" });
      }

      const [checklist, documents] = await Promise.all([
        Checklist.getByMarche(id_marche),
        Document.getByMarche(id_marche),
      ]);

      res.render("marches/fiche", {
        title: `Fiche — ${marche.numero}`,
        marche,
        checklist,
        documents,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("errors/500", {
        message: "Erreur lors du chargement de la fiche.",
      });
    }
  },

  // POST /marches/:id/delete — suppression définitive (irréversible), avec
  // suppression en cascade de la checklist et des documents joints, y compris
  // les fichiers physiques sur le disque. Confirmé côté client dans marches.js.
  async remove(req, res) {
    const id_marche = req.params.id;

    try {
      const marche = await Marche.getById(id_marche);
      if (!marche) {
        return res.status(404).render("404", { title: "Marché introuvable" });
      }

      // best-effort cleanup of the physical files before removing the DB rows
      const documents = await Document.getByMarche(id_marche);
      documents.forEach((d) => {
        const filePath = path.join(
          __dirname,
          "../..",
          d.chemin_dossier,
          d.nom_stocke,
        );
        fs.unlink(filePath, () => {}); // ignore errors (already missing, etc.)
      });

      await Checklist.deleteByMarche(id_marche);
      await Document.deleteByEntity("MARCHE", id_marche);
      await Marche.remove(id_marche);

      await Historique.log({
        utilisateur_id: req.session.user.id_utilisateur,
        action: "ARCHIVE", // pas de valeur "DELETE" dans l'enum historique.action
        entite_type: "MARCHE",
        entite_id: id_marche,
        details: `Suppression définitive du marché ${marche.numero}`,
      });

      res.redirect("/marches");
    } catch (err) {
      console.error(err);
      res.status(500).render("errors/500", {
        message: "Erreur lors de la suppression du marché.",
      });
    }
  },

  // GET /marches/echeances — deadline alert dashboard: marchés with an upcoming date_prochaine_echeance
  async echeances(req, res) {
    try {
      const daysAhead = parseInt(req.query.jours, 10) || 30;

      const echeances = await Marche.getEcheancesProches(daysAhead);

      res.render("marches/echeances", {
        title: "Échéances à venir",
        echeances,
        daysAhead,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("errors/500", {
        message: "Erreur lors du chargement des échéances.",
      });
    }
  },
};

module.exports = marcheController;
