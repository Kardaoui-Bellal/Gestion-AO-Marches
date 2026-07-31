require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const bcrypt = require("bcrypt");
const pool = require("../config/db");

// ────────────────────────────────────────────────────────────
// Ce script vide toutes les données transactionnelles (utilisateurs,
// fournisseurs, appels d'offres, offres, marchés, checklist, documents,
// historique) et recrée un jeu de données de démonstration cohérent.
//
// Les référentiels (referentiels_seed.sql) ne sont JAMAIS touchés ici —
// ce sont des données de configuration, pas des données de démonstration.
//
// Usage : npm run seed:demo
// ────────────────────────────────────────────────────────────

async function getRefMap() {
    const [rows] = await pool.execute(
        `SELECT id_ref, type_referentiel, code FROM referentiels`
    );
    if (rows.length === 0) {
        console.error("Aucun référentiel trouvé. Exécutez referentiels_seed.sql d'abord.");
        process.exit(1);
    }
    const map = {};
    for (const r of rows) {
        map[`${r.type_referentiel}:${r.code}`] = r.id_ref;
    }
    return map;
}

async function cleanup() {
    console.log("Nettoyage des données existantes...");
    // Ordre obligatoire pour respecter les contraintes de clé étrangère.
    await pool.execute(`DELETE FROM documents`);
    await pool.execute(`DELETE FROM checklist`);
    await pool.execute(`DELETE FROM offres`);
    await pool.execute(`DELETE FROM marches`);
    await pool.execute(`DELETE FROM appels_offres`);
    await pool.execute(`DELETE FROM historique`);
    await pool.execute(`DELETE FROM fournisseurs`);
    await pool.execute(`DELETE FROM utilisateurs`);

    // Repart les compteurs auto-increment à 1 pour des IDs propres.
    for (const table of ["documents", "checklist", "offres", "marches", "appels_offres", "historique", "fournisseurs", "utilisateurs"]) {
        await pool.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
    }
    console.log("Nettoyage terminé.\n");
}

async function seedUtilisateurs(ref) {
    console.log("Création des utilisateurs (un par profil)...");
    const comptes = [
        { nom: "Amine Admin", email: "admin@ormvasm.ma", motDePasse: "admin123", role: "ADMIN" },
        { nom: "Fatima Zahra Gestionnaire", email: "gestionnaire@ormvasm.ma", motDePasse: "gestion123", role: "GESTIONNAIRE" },
        { nom: "Youssef Consultant", email: "consultant@ormvasm.ma", motDePasse: "consult123", role: "CONSULTANT" },
    ];

    const ids = {};
    for (const c of comptes) {
        const hash = await bcrypt.hash(c.motDePasse, 10);
        const [result] = await pool.execute(
            `INSERT INTO utilisateurs (nom, email, mot_de_passe_hash, profil_id, actif) VALUES (?, ?, ?, ?, 1)`,
            [c.nom, c.email, hash, ref[`ROLE:${c.role}`]]
        );
        ids[c.role] = result.insertId;
        console.log(`  ${c.role.padEnd(13)} → ${c.email} / ${c.motDePasse}`);
    }
    console.log("");
    return ids;
}

async function seedFournisseurs(ref) {
    console.log("Création des fournisseurs...");
    const fournisseurs = [
        { raison_sociale: "TechnoSoft Maroc", ice: "001234567000012", domaine: "IT", email: "contact@technosoft.ma", telephone: "0522000001", contact: "M. El Amrani" },
        { raison_sociale: "InfoSystème SARL", ice: "001234567000029", domaine: "IT", email: "contact@infosysteme.ma", telephone: "0522000002", contact: "Mme Idrissi" },
        { raison_sociale: "Atlas BTP", ice: "001234567000036", domaine: "TRAVAUX", email: "contact@atlasbtp.ma", telephone: "0528000003", contact: "M. Bennani" },
        { raison_sociale: "Sud Fournitures", ice: "001234567000043", domaine: "FOURNITURES", email: "contact@sudfournitures.ma", telephone: "0528000004", contact: "Mme Alaoui" },
        { raison_sociale: "ConsultPro Services", ice: "001234567000050", domaine: "SERVICES", email: "contact@consultpro.ma", telephone: "0522000005", contact: "M. Tazi" },
    ];

    const ids = {};
    for (const f of fournisseurs) {
        const [result] = await pool.execute(
            `INSERT INTO fournisseurs (raison_sociale, ice, adresse, telephone, email, contact, domaine_activite_id, actif)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            [f.raison_sociale, f.ice, "Agadir, Maroc", f.telephone, f.email, f.contact, ref[`DOMAINE_ACTIVITE:${f.domaine}`]]
        );
        ids[f.raison_sociale] = result.insertId;
        console.log(`  ${f.raison_sociale}`);
    }
    console.log("");
    return ids;
}

async function seedAppelsOffres(ref, fournisseurIds) {
    console.log("Création des appels d'offres...");
    const aos = [
        {
            numero_ao: "AO-2026-001", objet: "Acquisition de matériel informatique",
            categorie: "FOURNITURES", etat: "PUBLIE", montant_estimatif: 450000,
            date_lancement: "2026-06-01", date_limite_depot: "2026-07-15", date_ouverture_plis: null,
            date_attribution: null, fournisseur_attributaire: null,
        },
        {
            numero_ao: "AO-2026-002", objet: "Travaux de réhabilitation du siège régional",
            categorie: "TRAVAUX", etat: "EN_EVALUATION", montant_estimatif: 1200000,
            date_lancement: "2026-05-10", date_limite_depot: "2026-06-20", date_ouverture_plis: "2026-06-21",
            date_attribution: null, fournisseur_attributaire: null,
        },
        {
            numero_ao: "AO-2026-003", objet: "Développement de l'application de gestion des marchés",
            categorie: "SERVICES", etat: "ATTRIBUE", montant_estimatif: 380000,
            date_lancement: "2026-03-01", date_limite_depot: "2026-04-01", date_ouverture_plis: "2026-04-02",
            date_attribution: "2026-04-20", fournisseur_attributaire: "TechnoSoft Maroc",
        },
        {
            numero_ao: "AO-2026-004", objet: "Prestations d'audit organisationnel",
            categorie: "SERVICES", etat: "ATTRIBUE", montant_estimatif: 220000,
            date_lancement: "2026-02-15", date_limite_depot: "2026-03-15", date_ouverture_plis: "2026-03-16",
            date_attribution: "2026-04-05", fournisseur_attributaire: "ConsultPro Services",
        },
        {
            numero_ao: "AO-2026-005", objet: "Fourniture de mobilier de bureau",
            categorie: "FOURNITURES", etat: "ANNULE", montant_estimatif: 95000,
            date_lancement: "2026-01-10", date_limite_depot: "2026-02-10", date_ouverture_plis: null,
            date_attribution: null, fournisseur_attributaire: null,
        },
    ];

    const ids = {};
    for (const ao of aos) {
        const [result] = await pool.execute(
            `INSERT INTO appels_offres (
                numero_ao, objet, categorie_id, etat_id, montant_estimatif,
                date_lancement, date_limite_depot, date_ouverture_plis,
                date_attribution, fournisseur_attributaire_id, observation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ao.numero_ao, ao.objet, ref[`CATEGORIE_AO:${ao.categorie}`], ref[`ETAT_AO:${ao.etat}`], ao.montant_estimatif,
                ao.date_lancement, ao.date_limite_depot, ao.date_ouverture_plis,
                ao.date_attribution, ao.fournisseur_attributaire ? fournisseurIds[ao.fournisseur_attributaire] : null,
                null,
            ]
        );
        ids[ao.numero_ao] = result.insertId;

        // Reproduit l'auto-initialisation de la checklist faite par appelOffreController.create
        await initChecklist(ref, "AO", result.insertId, "ETAPE_CHECKLIST_AO", ao.etat);

        console.log(`  ${ao.numero_ao} — ${ao.etat}`);
    }
    console.log("");
    return ids;
}

async function seedOffres(ref, aoIds, fournisseurIds) {
    console.log("Création des offres...");
    const offres = [
        { ao: "AO-2026-002", fournisseur: "Atlas BTP", montant: 1150000, statut: "ADMISSIBLE", date: "2026-06-18" },
        { ao: "AO-2026-002", fournisseur: "Sud Fournitures", montant: 1180000, statut: "ADMISSIBLE", date: "2026-06-19" },
        { ao: "AO-2026-003", fournisseur: "TechnoSoft Maroc", montant: 375000, statut: "RETENUE", date: "2026-03-28" },
        { ao: "AO-2026-003", fournisseur: "InfoSystème SARL", montant: 390000, statut: "REJETEE", date: "2026-03-29" },
        { ao: "AO-2026-004", fournisseur: "ConsultPro Services", montant: 215000, statut: "RETENUE", date: "2026-03-10" },
    ];

    for (const o of offres) {
        await pool.execute(
            `INSERT INTO offres (appel_offre_id, fournisseur_id, montant_propose, date_soumission, statut_id)
             VALUES (?, ?, ?, ?, ?)`,
            [aoIds[o.ao], fournisseurIds[o.fournisseur], o.montant, o.date, ref[`STATUT_OFFRE:${o.statut}`]]
        );
        console.log(`  ${o.ao} ← ${o.fournisseur} (${o.statut})`);
    }
    console.log("");
}

async function seedMarches(ref, aoIds, fournisseurIds) {
    console.log("Création des marchés...");
    const marches = [
        {
            numero: "M-2026-001", objet: "Développement de l'application de gestion des marchés",
            type_marche: "FERME", statut: "EN_COURS", fournisseur: "TechnoSoft Maroc", ao: "AO-2026-003",
            montant: 375000, date_notification: "2026-04-25", date_debut: "2026-05-01", date_fin: "2026-11-01",
            delai_execution_jours: 180, date_prochaine_echeance: "2026-11-01",
        },
        {
            numero: "M-2026-002", objet: "Prestations d'audit organisationnel",
            type_marche: "FERME", statut: "NOTIFIE", fournisseur: "ConsultPro Services", ao: "AO-2026-004",
            montant: 215000, date_notification: "2026-04-10", date_debut: "2026-04-20", date_fin: "2026-07-20",
            delai_execution_jours: 90, date_prochaine_echeance: "2026-07-20",
        },
        {
            numero: "M-2025-018", objet: "Maintenance du réseau informatique du siège",
            type_marche: "RECONDUCTIBLE", statut: "ACHEVE", fournisseur: "InfoSystème SARL", ao: null,
            montant: 160000, date_notification: "2025-09-01", date_debut: "2025-09-15", date_fin: "2026-03-15",
            delai_execution_jours: 180, date_reception_provisoire: "2026-03-10", date_reception_definitive: "2026-03-20",
            date_prochaine_echeance: null,
        },
    ];

    const ids = {};
    for (const m of marches) {
        const [result] = await pool.execute(
            `INSERT INTO marches (
                numero, objet, type_marche_id, statut_id, fournisseur_id,
                appel_offre_id, montant, date_notification, date_debut, date_fin,
                delai_execution_jours, date_reception_provisoire, date_reception_definitive,
                date_prochaine_echeance, observation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                m.numero, m.objet, ref[`TYPE_MARCHE:${m.type_marche}`], ref[`STATUT_MARCHE:${m.statut}`], fournisseurIds[m.fournisseur],
                m.ao ? aoIds[m.ao] : null, m.montant, m.date_notification, m.date_debut, m.date_fin,
                m.delai_execution_jours || null, m.date_reception_provisoire || null, m.date_reception_definitive || null,
                m.date_prochaine_echeance || null, null,
            ]
        );
        ids[m.numero] = result.insertId;

        // Reproduit l'auto-initialisation de la checklist faite par marcheController.create
        await initChecklist(ref, "MARCHE", result.insertId, "ETAPE_CHECKLIST_MARCHE", m.statut);

        console.log(`  ${m.numero} — ${m.statut}`);
    }
    console.log("");
    return ids;
}

// Initialise la checklist d'une entité (AO ou MARCHE) avec toutes les étapes
// du bon type de référentiel, en marquant certaines étapes comme "DONE" selon
// l'avancement réel de l'entité (pour que les données de démo soient cohérentes
// avec leur statut plutôt que 100% "À faire").
async function initChecklist(ref, typeEntite, entiteId, etapeTypeRef, statutActuel) {
    const [steps] = await pool.execute(
        `SELECT id_ref, code FROM referentiels WHERE type_referentiel = ? AND actif = 1 ORDER BY ordre_affichage ASC`,
        [etapeTypeRef]
    );

    const progressionParStatut = {
        // AO
        BROUILLON: 0, PUBLIE: 2, OUVERTURE_PLIS: 4, EN_EVALUATION: 6, ATTRIBUE: steps.length, INFRUCTUEUX: 3, ANNULE: 1,
        // MARCHE
        NOTIFIE: 1, EN_COURS: 2, SUSPENDU: 2, ACHEVE: steps.length, RESILIE: 1, RENOUVELE: steps.length, EXPIRE: steps.length,
    };
    const nbValidees = progressionParStatut[statutActuel] ?? 0;

    for (let i = 0; i < steps.length; i++) {
        const isDone = i < nbValidees;
        const statutCode = isDone ? "DONE" : "TODO";
        await pool.execute(
            `INSERT INTO checklist (type_entite, appel_offre_id, marche_id, etape_id, statut_id, date_validation)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                typeEntite,
                typeEntite === "AO" ? entiteId : null,
                typeEntite === "MARCHE" ? entiteId : null,
                steps[i].id_ref,
                ref[`STATUT_CHECKLIST:${statutCode}`],
                isDone ? "2026-05-01" : null,
            ]
        );
    }
}

async function seed() {
    try {
        console.log("=== Reseed complet — données de démonstration ===\n");

        const ref = await getRefMap();

        await cleanup();

        const utilisateurIds = await seedUtilisateurs(ref);
        const fournisseurIds = await seedFournisseurs(ref);
        const aoIds = await seedAppelsOffres(ref, fournisseurIds);
        await seedOffres(ref, aoIds, fournisseurIds);
        await seedMarches(ref, aoIds, fournisseurIds);

        console.log("=== Reseed terminé avec succès ===\n");
        console.log("Comptes de connexion :");
        console.log("  ADMIN         admin@ormvasm.ma / admin123");
        console.log("  GESTIONNAIRE  gestionnaire@ormvasm.ma / gestion123");
        console.log("  CONSULTANT    consultant@ormvasm.ma / consult123");
        console.log("\n⚠️  Changez ces mots de passe si cette base sert au-delà de vos tests locaux.");

        process.exit(0);
    } catch (err) {
        console.error("Erreur lors du reseed:", err);
        process.exit(1);
    }
}

seed();