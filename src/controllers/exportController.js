const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const AppelOffre = require("../models/appelOffreModel");
const Marche = require("../models/marcheModel");
const Fournisseur = require("../models/fournisseurModel");
const Historique = require("../models/historiqueModel");

const exportController = {
    // GET /export/appels-offres/pdf
    async appelsOffresPdf(req, res) {
        try {
            const { categorie_id, etat_id } = req.query;
            const appelsOffres = await AppelOffre.getByFilters({ categorie_id, etat_id });

            const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=appels_offres_${Date.now()}.pdf`);
            doc.pipe(res);

            doc.fontSize(16).text("ORMVA/SM — Liste des Appels d'Offres", { align: "center" });
            doc.moveDown(0.3);
            doc.fontSize(9).fillColor("gray").text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, { align: "center" });
            doc.moveDown(1);
            doc.fillColor("black");

            const tableTop = doc.y;
            const colWidths = [90, 200, 100, 110, 90, 130];
            const headers = ["N° AO", "Objet", "Catégorie", "État", "Montant (DH)", "Fournisseur"];

            let x = doc.x;
            headers.forEach((h, i) => {
                doc.fontSize(9).font("Helvetica-Bold").text(h, x, tableTop, { width: colWidths[i] });
                x += colWidths[i];
            });

            doc.moveDown(0.5);
            let y = doc.y;

            appelsOffres.forEach(ao => {
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
                    doc.fontSize(8).font("Helvetica").text(String(cell), x, y, { width: colWidths[i] });
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
                action: "UPLOAD", // no dedicated EXPORT action in the enum — see note below
                entite_type: "APPEL_OFFRE",
                entite_id: 0,
                details: `Export PDF de la liste des appels d'offres (${appelsOffres.length} lignes)`,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors de la génération du PDF." });
        }
    },

    // GET /export/appels-offres/excel
    async appelsOffresExcel(req, res) {
        try {
            const { categorie_id, etat_id } = req.query;
            const appelsOffres = await AppelOffre.getByFilters({ categorie_id, etat_id });

            const workbook = new ExcelJS.Workbook();
            workbook.creator = "ORMVA/SM — Bureau Informatique";
            workbook.created = new Date();

            const sheet = workbook.addWorksheet("Appels d'offres");

            sheet.columns = [
                { header: "N° AO", key: "numero_ao", width: 18 },
                { header: "Objet", key: "objet", width: 45 },
                { header: "Catégorie", key: "categorie_libelle", width: 20 },
                { header: "État", key: "etat_libelle", width: 18 },
                { header: "Montant estimatif (DH)", key: "montant_estimatif", width: 20 },
                { header: "Date lancement", key: "date_lancement", width: 15 },
                { header: "Date limite dépôt", key: "date_limite_depot", width: 16 },
                { header: "Fournisseur attributaire", key: "fournisseur_nom", width: 28 },
            ];

            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD9E1F2" },
            };

            appelsOffres.forEach(ao => {
                sheet.addRow({
                    numero_ao: ao.numero_ao,
                    objet: ao.objet,
                    categorie_libelle: ao.categorie_libelle,
                    etat_libelle: ao.etat_libelle,
                    montant_estimatif: Number(ao.montant_estimatif),
                    date_lancement: ao.date_lancement ? new Date(ao.date_lancement).toLocaleDateString("fr-FR") : "",
                    date_limite_depot: ao.date_limite_depot ? new Date(ao.date_limite_depot).toLocaleDateString("fr-FR") : "",
                    fournisseur_nom: ao.fournisseur_nom || "—",
                });
            });

            sheet.getColumn("montant_estimatif").numFmt = "#,##0.00";

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename=appels_offres_${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPLOAD",
                entite_type: "APPEL_OFFRE",
                entite_id: 0,
                details: `Export Excel de la liste des appels d'offres (${appelsOffres.length} lignes)`,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors de la génération du fichier Excel." });
        }
    },

    // GET /export/marches/pdf
    async marchesPdf(req, res) {
        try {
            const { type_marche_id, statut_id } = req.query;
            const marches = await Marche.getByFilters({ type_marche_id, statut_id });

            const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=marches_${Date.now()}.pdf`);
            doc.pipe(res);

            doc.fontSize(16).text("ORMVA/SM — Liste des Marchés", { align: "center" });
            doc.moveDown(0.3);
            doc.fontSize(9).fillColor("gray").text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, { align: "center" });
            doc.moveDown(1);
            doc.fillColor("black");

            const tableTop = doc.y;
            const colWidths = [90, 200, 100, 110, 90, 130];
            const headers = ["N°", "Objet", "Type", "Statut", "Montant (DH)", "Fournisseur"];

            let x = doc.x;
            headers.forEach((h, i) => {
                doc.fontSize(9).font("Helvetica-Bold").text(h, x, tableTop, { width: colWidths[i] });
                x += colWidths[i];
            });

            doc.moveDown(0.5);
            let y = doc.y;

            marches.forEach(m => {
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
                    doc.fontSize(8).font("Helvetica").text(String(cell), x, y, { width: colWidths[i] });
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
                action: "UPLOAD",
                entite_type: "MARCHE",
                entite_id: 0,
                details: `Export PDF de la liste des marchés (${marches.length} lignes)`,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors de la génération du PDF." });
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

            marches.forEach(m => {
                sheet.addRow({
                    numero: m.numero,
                    objet: m.objet,
                    type_marche_libelle: m.type_marche_libelle,
                    statut_libelle: m.statut_libelle,
                    montant: Number(m.montant),
                    date_debut: m.date_debut ? new Date(m.date_debut).toLocaleDateString("fr-FR") : "",
                    date_fin: m.date_fin ? new Date(m.date_fin).toLocaleDateString("fr-FR") : "",
                    fournisseur_nom: m.fournisseur_nom,
                });
            });

            sheet.getColumn("montant").numFmt = "#,##0.00";

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename=marches_${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

            await Historique.log({
                utilisateur_id: req.session.user.id_utilisateur,
                action: "UPLOAD",
                entite_type: "MARCHE",
                entite_id: 0,
                details: `Export Excel de la liste des marchés (${marches.length} lignes)`,
            });
        } catch (err) {
            console.error(err);
            res.status(500).render("errors/500", { message: "Erreur lors de la génération du fichier Excel." });
        }
    },
};

module.exports = exportController;