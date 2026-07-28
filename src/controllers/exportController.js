const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const AppelOffre = require("../models/appelOffreModel");
const Marche = require("../models/marcheModel");
const Fournisseur = require("../models/fournisseurModel");
const Historique = require("../models/historiqueModel");
const Checklist = require("../models/checklistModel");
const Document = require("../models/documentModel");

const exportController = {
  // GET /export/appels-offres/pdf
  async appelsOffresPdf(req, res) {
    try {
      const { categorie_id, etat_id } = req.query;
      const appelsOffres = await AppelOffre.getByFilters({
        categorie_id,
        etat_id,
      });

      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        layout: "landscape",
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=appels_offres_${Date.now()}.pdf`,
      );
      doc.pipe(res);

      doc
        .fontSize(16)
        .text("ORMVA/SM — Liste des Appels d'Offres", { align: "center" });
      doc.moveDown(0.3);
      doc
        .fontSize(9)
        .fillColor("gray")
        .text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, {
          align: "center",
        });
      doc.moveDown(1);
      doc.fillColor("black");

      const tableTop = doc.y;
      const colWidths = [90, 200, 100, 110, 90, 130];
      const headers = [
        "N° AO",
        "Objet",
        "Catégorie",
        "État",
        "Montant (DH)",
        "Fournisseur",
      ];

      let x = doc.x;
      headers.forEach((h, i) => {
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .text(h, x, tableTop, { width: colWidths[i] });
        x += colWidths[i];
      });

      doc.moveDown(0.5);
      let y = doc.y;

      appelsOffres.forEach((ao) => {
        x = doc.x;
        const row = [
          ao.numero_ao,
          ao.objet.length > 45 ? ao.objet.slice(0, 45) + "…" : ao.objet,
          ao.categorie_libelle,
          ao.etat_libelle,
          Number(ao.montant_estimatif).toLocaleString("fr-FR"),
          ao.fournisseur_nom || "—",
        ];

        row.forEach((cell, i) => {
          doc
            .fontSize(8)
            .font("Helvetica")
            .text(String(cell), x, y, { width: colWidths[i] });
          x += colWidths[i];
        });

        y += 20;

        if (y > 500) {
          doc.addPage({ margin: 40, size: "A4", layout: "landscape" });
          y = 40;
        }
      });

      doc.end();

      await Historique.log({
        utilisateur_id: req.session.user.id_utilisateur,
        action: "EXPORT", // no dedicated EXPORT action in the enum — see note below
        entite_type: "APPEL_OFFRE",
        entite_id: 0,
        details: `Export PDF de la liste des appels d'offres (${appelsOffres.length} lignes)`,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .render("errors/500", {
          message: "Erreur lors de la génération du PDF.",
        });
    }
  },

  // GET /export/appels-offres/excel
  async appelsOffresExcel(req, res) {
    try {
      const { categorie_id, etat_id } = req.query;
      const appelsOffres = await AppelOffre.getByFilters({
        categorie_id,
        etat_id,
      });

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "ORMVA/SM — Bureau Informatique";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("Appels d'offres");

      sheet.columns = [
        { header: "N° AO", key: "numero_ao", width: 18 },
        { header: "Objet", key: "objet", width: 45 },
        { header: "Catégorie", key: "categorie_libelle", width: 20 },
        { header: "État", key: "etat_libelle", width: 18 },
        {
          header: "Montant estimatif (DH)",
          key: "montant_estimatif",
          width: 20,
        },
        { header: "Date lancement", key: "date_lancement", width: 15 },
        { header: "Date limite dépôt", key: "date_limite_depot", width: 16 },
        {
          header: "Fournisseur attributaire",
          key: "fournisseur_nom",
          width: 28,
        },
      ];

      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" },
      };

      appelsOffres.forEach((ao) => {
        sheet.addRow({
          numero_ao: ao.numero_ao,
          objet: ao.objet,
          categorie_libelle: ao.categorie_libelle,
          etat_libelle: ao.etat_libelle,
          montant_estimatif: Number(ao.montant_estimatif),
          date_lancement: ao.date_lancement
            ? new Date(ao.date_lancement).toLocaleDateString("fr-FR")
            : "",
          date_limite_depot: ao.date_limite_depot
            ? new Date(ao.date_limite_depot).toLocaleDateString("fr-FR")
            : "",
          fournisseur_nom: ao.fournisseur_nom || "—",
        });
      });

      sheet.getColumn("montant_estimatif").numFmt = "#,##0.00";

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=appels_offres_${Date.now()}.xlsx`,
      );

      await workbook.xlsx.write(res);
      res.end();

      await Historique.log({
        utilisateur_id: req.session.user.id_utilisateur,
        action: "EXPORT",
        entite_type: "APPEL_OFFRE",
        entite_id: 0,
        details: `Export Excel de la liste des appels d'offres (${appelsOffres.length} lignes)`,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .render("errors/500", {
          message: "Erreur lors de la génération du fichier Excel.",
        });
    }
  },

  // GET /export/marches/pdf
  async marchesPdf(req, res) {
    try {
      const { type_marche_id, statut_id } = req.query;
      const marches = await Marche.getByFilters({ type_marche_id, statut_id });

      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        layout: "landscape",
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=marches_${Date.now()}.pdf`,
      );
      doc.pipe(res);

      doc
        .fontSize(16)
        .text("ORMVA/SM — Liste des Marchés", { align: "center" });
      doc.moveDown(0.3);
      doc
        .fontSize(9)
        .fillColor("gray")
        .text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, {
          align: "center",
        });
      doc.moveDown(1);
      doc.fillColor("black");

      const tableTop = doc.y;
      const colWidths = [90, 200, 100, 110, 90, 130];
      const headers = [
        "N°",
        "Objet",
        "Type",
        "Statut",
        "Montant (DH)",
        "Fournisseur",
      ];

      let x = doc.x;
      headers.forEach((h, i) => {
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .text(h, x, tableTop, { width: colWidths[i] });
        x += colWidths[i];
      });

      doc.moveDown(0.5);
      let y = doc.y;

      marches.forEach((m) => {
        x = doc.x;
        const row = [
          m.numero,
          m.objet.length > 45 ? m.objet.slice(0, 45) + "…" : m.objet,
          m.type_marche_libelle,
          m.statut_libelle,
          Number(m.montant).toLocaleString("fr-FR"),
          m.fournisseur_nom,
        ];

        row.forEach((cell, i) => {
          doc
            .fontSize(8)
            .font("Helvetica")
            .text(String(cell), x, y, { width: colWidths[i] });
          x += colWidths[i];
        });

        y += 20;

        if (y > 500) {
          doc.addPage({ margin: 40, size: "A4", layout: "landscape" });
          y = 40;
        }
      });

      doc.end();

      await Historique.log({
        utilisateur_id: req.session.user.id_utilisateur,
        action: "EXPORT",
        entite_type: "MARCHE",
        entite_id: 0,
        details: `Export PDF de la liste des marchés (${marches.length} lignes)`,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .render("errors/500", {
          message: "Erreur lors de la génération du PDF.",
        });
    }
  },

  // GET /export/marches/excel
  async marchesExcel(req, res) {
    try {
      const { type_marche_id, statut_id } = req.query;
      const marches = await Marche.getByFilters({ type_marche_id, statut_id });

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "ORMVA/SM — Bureau Informatique";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("Marchés");

      sheet.columns = [
        { header: "N° Marché", key: "numero", width: 18 },
        { header: "Objet", key: "objet", width: 45 },
        { header: "Type", key: "type_marche_libelle", width: 18 },
        { header: "Statut", key: "statut_libelle", width: 18 },
        { header: "Montant (DH)", key: "montant", width: 18 },
        { header: "Date début", key: "date_debut", width: 14 },
        { header: "Date fin", key: "date_fin", width: 14 },
        { header: "Fournisseur", key: "fournisseur_nom", width: 28 },
      ];

      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" },
      };

      marches.forEach((m) => {
        sheet.addRow({
          numero: m.numero,
          objet: m.objet,
          type_marche_libelle: m.type_marche_libelle,
          statut_libelle: m.statut_libelle,
          montant: Number(m.montant),
          date_debut: m.date_debut
            ? new Date(m.date_debut).toLocaleDateString("fr-FR")
            : "",
          date_fin: m.date_fin
            ? new Date(m.date_fin).toLocaleDateString("fr-FR")
            : "",
          fournisseur_nom: m.fournisseur_nom,
        });
      });

      sheet.getColumn("montant").numFmt = "#,##0.00";

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=marches_${Date.now()}.xlsx`,
      );

      await workbook.xlsx.write(res);
      res.end();

      await Historique.log({
        utilisateur_id: req.session.user.id_utilisateur,
        action: "EXPORT",
        entite_type: "MARCHE",
        entite_id: 0,
        details: `Export Excel de la liste des marchés (${marches.length} lignes)`,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .render("errors/500", {
          message: "Erreur lors de la génération du fichier Excel.",
        });
    }
  },
  // GET /export/fournisseurs/excel
  async fournisseursExcel(req, res) {
    try {
      const { domaine_activite_id } = req.query;
      const fournisseurs = domaine_activite_id
        ? await Fournisseur.getByDomaine(domaine_activite_id)
        : await Fournisseur.getAll();

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "ORMVA/SM — Bureau Informatique";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("Fournisseurs");

      sheet.columns = [
        { header: "Raison sociale", key: "raison_sociale", width: 32 },
        { header: "ICE", key: "ice", width: 18 },
        { header: "Domaine d'activité", key: "domaine_activite_libelle", width: 24 },
        { header: "Téléphone", key: "telephone", width: 16 },
        { header: "Email", key: "email", width: 26 },
        { header: "Contact", key: "contact", width: 22 },
        { header: "Statut", key: "statut", width: 12 },
      ];

      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" },
      };

      fournisseurs.forEach((f) => {
        sheet.addRow({
          raison_sociale: f.raison_sociale,
          ice: f.ice,
          domaine_activite_libelle: f.domaine_activite_libelle,
          telephone: f.telephone || "",
          email: f.email || "",
          contact: f.contact || "",
          statut: f.actif ? "Actif" : "Inactif",
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=fournisseurs_${Date.now()}.xlsx`,
      );

      await workbook.xlsx.write(res);
      res.end();

      await Historique.log({
        utilisateur_id: req.session.user.id_utilisateur,
        action: "EXPORT",
        entite_type: "FOURNISSEUR",
        entite_id: 0,
        details: `Export Excel de la liste des fournisseurs (${fournisseurs.length} lignes)`,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .render("errors/500", {
          message: "Erreur lors de la génération du fichier Excel.",
        });
    }
  },

  async marcheFiche(req, res) {
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

      const doc = new PDFDocument({ margin: 50, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=fiche_marche_${marche.numero}.pdf`,
      );
      doc.pipe(res);

      // ---- Header ----
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("ORMVA/SM", { align: "center" });
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Office Régional de Mise en Valeur Agricole du Souss-Massa", {
          align: "center",
        });
      doc.moveDown(0.3);
      doc
        .fontSize(9)
        .fillColor("gray")
        .text("Bureau Informatique", { align: "center" });
      doc.fillColor("black");
      doc.moveDown(1);

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.8);

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(`FICHE MARCHÉ — ${marche.numero}`, { align: "center" });
      doc.moveDown(1);

      // ---- Informations générales ----
      const addField = (label, value) => {
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(label, { continued: true });
        doc.font("Helvetica").text(`  ${value ?? "—"}`);
      };

      doc.fontSize(12).font("Helvetica-Bold").text("Informations générales");
      doc.moveDown(0.3);
      addField("Objet :", marche.objet);
      addField("Type de marché :", marche.type_marche_libelle);
      addField("Statut :", marche.statut_libelle);
      addField("Fournisseur :", marche.fournisseur_nom);
      addField(
        "Montant :",
        `${Number(marche.montant).toLocaleString("fr-FR")} DH`,
      );
      doc.moveDown(0.8);

      // ---- Dates clés ----
      doc.fontSize(12).font("Helvetica-Bold").text("Dates clés");
      doc.moveDown(0.3);
      const fmtDate = (d) =>
        d ? new Date(d).toLocaleDateString("fr-FR") : "—";
      addField("Date de notification :", fmtDate(marche.date_notification));
      addField("Date de début :", fmtDate(marche.date_debut));
      addField("Date de fin :", fmtDate(marche.date_fin));
      addField(
        "Délai d'exécution :",
        marche.delai_execution_jours
          ? `${marche.delai_execution_jours} jours`
          : "—",
      );
      addField(
        "Réception provisoire :",
        fmtDate(marche.date_reception_provisoire),
      );
      addField(
        "Réception définitive :",
        fmtDate(marche.date_reception_definitive),
      );
      addField("Prochaine échéance :", fmtDate(marche.date_prochaine_echeance));
      doc.moveDown(0.8);

      // ---- Observation ----
      if (marche.observation) {
        doc.fontSize(12).font("Helvetica-Bold").text("Observation");
        doc.moveDown(0.3);
        doc.fontSize(10).font("Helvetica").text(marche.observation);
        doc.moveDown(0.8);
      }

      // ---- Checklist ----
      doc.fontSize(12).font("Helvetica-Bold").text("Suivi de la checklist");
      doc.moveDown(0.3);

      if (checklist.length === 0) {
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("gray")
          .text("Aucune étape de checklist enregistrée.");
        doc.fillColor("black");
      } else {
        checklist.forEach((c) => {
          const marker =
            c.statut_code === "DONE"
              ? "[✓]"
              : c.statut_code === "BLOCKED"
                ? "[!]"
                : "[ ]";
          doc
            .fontSize(9)
            .font("Helvetica")
            .text(
              `${marker} ${c.etape_libelle} — ${c.statut_libelle}${c.date_validation ? ` (${fmtDate(c.date_validation)})` : ""}`,
            );
        });
      }
      doc.moveDown(0.8);

      // ---- Documents joints ----
      doc.fontSize(12).font("Helvetica-Bold").text("Documents joints");
      doc.moveDown(0.3);

      if (documents.length === 0) {
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("gray")
          .text("Aucun document joint.");
        doc.fillColor("black");
      } else {
        documents.forEach((d) => {
          doc
            .fontSize(9)
            .font("Helvetica")
            .text(`• ${d.nom_original} (${d.type_document_libelle})`);
        });
      }

      // ---- Footer ----
      doc.moveDown(2);
      doc
        .fontSize(8)
        .fillColor("gray")
        .text(
          `Document généré automatiquement le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
          { align: "center" },
        );

      doc.end();

      await Historique.log({
        utilisateur_id: req.session.user.id_utilisateur,
        action: "EXPORT", // see note about EXPORT enum from before
        entite_type: "MARCHE",
        entite_id: id_marche,
        details: `Export de la fiche marché ${marche.numero}`,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .render("errors/500", {
          message: "Erreur lors de la génération de la fiche.",
        });
    }
  },
};

module.exports = exportController;