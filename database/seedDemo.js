require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const bcrypt = require("bcrypt");
const pool = require("../config/db");

// ────────────────────────────────────────────────────────────
// Ce script vide toutes les données transactionnelles (utilisateurs,
// fournisseurs, appels d'offres, offres, marchés, checklist, documents,
// historique) et recrée un jeu de données de démonstration riche et varié,
// pensé pour tester l'ensemble des fonctionnalités de l'application :
// tous les états d'AO, tous les statuts de marché, plusieurs échéances
// à différentes distances (urgentes, proches, lointaines), des marchés
// déjà expirés, un fournisseur inactif, etc.
//
// Les référentiels (referentiels_seed.sql) ne sont JAMAIS touchés ici —
// ce sont des données de configuration, pas des données de démonstration.
//
// Toutes les dates sont calculées relativement à "aujourd'hui" (au moment
// de l'exécution du script) via daysFromNow(), plutôt que codées en dur —
// comme ça, les échéances "dans 5 jours" / "dans 20 jours" restent vraies
// même si vous relancez ce script plusieurs semaines plus tard.
//
// Usage : npm run seed:demo
// ────────────────────────────────────────────────────────────

function daysFromNow(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
}

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
    await pool.execute(`DELETE FROM documents`);
    await pool.execute(`DELETE FROM checklist`);
    await pool.execute(`DELETE FROM offres`);
    await pool.execute(`DELETE FROM marches`);
    await pool.execute(`DELETE FROM appels_offres`);
    await pool.execute(`DELETE FROM historique`);
    await pool.execute(`DELETE FROM fournisseurs`);
    await pool.execute(`DELETE FROM utilisateurs`);

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
        { raison_sociale: "TechnoSoft Maroc", ice: "001234567000012", domaine: "IT", email: "contact@technosoft.ma", telephone: "0522000001", contact: "M. El Amrani", actif: 1 },
        { raison_sociale: "InfoSystème SARL", ice: "001234567000029", domaine: "IT", email: "contact@infosysteme.ma", telephone: "0522000002", contact: "Mme Idrissi", actif: 1 },
        { raison_sociale: "DataCore Solutions", ice: "001234567000067", domaine: "IT", email: "contact@datacore.ma", telephone: "0522000006", contact: "M. Fassi", actif: 1 },
        { raison_sociale: "Atlas BTP", ice: "001234567000036", domaine: "TRAVAUX", email: "contact@atlasbtp.ma", telephone: "0528000003", contact: "M. Bennani", actif: 1 },
        { raison_sociale: "Souss Construction", ice: "001234567000074", domaine: "TRAVAUX", email: "contact@soussconstruction.ma", telephone: "0528000007", contact: "M. Ouahbi", actif: 1 },
        { raison_sociale: "Anza Travaux Publics", ice: "001234567000081", domaine: "TRAVAUX", email: "contact@anzatp.ma", telephone: "0528000008", contact: "Mme Chraibi", actif: 1 },
        { raison_sociale: "Sud Fournitures", ice: "001234567000043", domaine: "FOURNITURES", email: "contact@sudfournitures.ma", telephone: "0528000004", contact: "Mme Alaoui", actif: 1 },
        { raison_sociale: "Agadir Bureau Équipements", ice: "001234567000098", domaine: "FOURNITURES", email: "contact@agadirbureau.ma", telephone: "0528000009", contact: "M. Zniber", actif: 1 },
        { raison_sociale: "ConsultPro Services", ice: "001234567000050", domaine: "SERVICES", email: "contact@consultpro.ma", telephone: "0522000005", contact: "M. Tazi", actif: 1 },
        { raison_sociale: "Maroc Audit & Conseil", ice: "001234567000105", domaine: "SERVICES", email: "contact@marocaudit.ma", telephone: "0522000010", contact: "Mme Benjelloun", actif: 0 },
    ];

    const ids = {};
    for (const f of fournisseurs) {
        const [result] = await pool.execute(
            `INSERT INTO fournisseurs (raison_sociale, ice, adresse, telephone, email, contact, domaine_activite_id, actif)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [f.raison_sociale, f.ice, "Agadir, Maroc", f.telephone, f.email, f.contact, ref[`DOMAINE_ACTIVITE:${f.domaine}`], f.actif]
        );
        ids[f.raison_sociale] = result.insertId;
        console.log(`  ${f.raison_sociale}${f.actif ? "" : " (inactif)"}`);
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
            date_lancement: daysFromNow(-30), date_limite_depot: daysFromNow(14), date_ouverture_plis: null,
            date_attribution: null, fournisseur_attributaire: null,
        },
        {
            numero_ao: "AO-2026-002", objet: "Travaux de réhabilitation du siège régional",
            categorie: "TRAVAUX", etat: "EN_EVALUATION", montant_estimatif: 1200000,
            date_lancement: daysFromNow(-60), date_limite_depot: daysFromNow(-20), date_ouverture_plis: daysFromNow(-19),
            date_attribution: null, fournisseur_attributaire: null,
        },
        {
            numero_ao: "AO-2026-003", objet: "Développement de l'application de gestion des marchés",
            categorie: "SERVICES", etat: "ATTRIBUE", montant_estimatif: 380000,
            date_lancement: daysFromNow(-120), date_limite_depot: daysFromNow(-90), date_ouverture_plis: daysFromNow(-89),
            date_attribution: daysFromNow(-70), fournisseur_attributaire: "TechnoSoft Maroc",
        },
        {
            numero_ao: "AO-2026-004", objet: "Prestations d'audit organisationnel",
            categorie: "SERVICES", etat: "ATTRIBUE", montant_estimatif: 220000,
            date_lancement: daysFromNow(-140), date_limite_depot: daysFromNow(-110), date_ouverture_plis: daysFromNow(-109),
            date_attribution: daysFromNow(-95), fournisseur_attributaire: "ConsultPro Services",
        },
        {
            numero_ao: "AO-2026-005", objet: "Fourniture de mobilier de bureau",
            categorie: "FOURNITURES", etat: "ANNULE", montant_estimatif: 95000,
            date_lancement: daysFromNow(-180), date_limite_depot: daysFromNow(-150), date_ouverture_plis: null,
            date_attribution: null, fournisseur_attributaire: null,
        },
        {
            numero_ao: "AO-2026-006", objet: "Construction d'un canal d'irrigation — secteur Nord",
            categorie: "TRAVAUX", etat: "ATTRIBUE", montant_estimatif: 2400000,
            date_lancement: daysFromNow(-200), date_limite_depot: daysFromNow(-170), date_ouverture_plis: daysFromNow(-169),
            date_attribution: daysFromNow(-150), fournisseur_attributaire: "Atlas BTP",
        },
        {
            numero_ao: "AO-2026-007", objet: "Acquisition de véhicules de service",
            categorie: "FOURNITURES", etat: "INFRUCTUEUX", montant_estimatif: 680000,
            date_lancement: daysFromNow(-100), date_limite_depot: daysFromNow(-70), date_ouverture_plis: daysFromNow(-69),
            date_attribution: null, fournisseur_attributaire: null,
        },
        {
            numero_ao: "AO-2026-008", objet: "Maintenance du parc informatique",
            categorie: "SERVICES", etat: "OUVERTURE_PLIS", montant_estimatif: 150000,
            date_lancement: daysFromNow(-40), date_limite_depot: daysFromNow(-10), date_ouverture_plis: daysFromNow(-9),
            date_attribution: null, fournisseur_attributaire: null,
        },
        {
            numero_ao: "AO-2026-009", objet: "Réhabilitation du réseau d'irrigation — secteur Sud",
            categorie: "TRAVAUX", etat: "BROUILLON", montant_estimatif: 1800000,
            date_lancement: null, date_limite_depot: null, date_ouverture_plis: null,
            date_attribution: null, fournisseur_attributaire: null,
        },
        {
            numero_ao: "AO-2026-010", objet: "Fourniture d'équipements de bureau",
            categorie: "FOURNITURES", etat: "ATTRIBUE", montant_estimatif: 310000,
            date_lancement: daysFromNow(-80), date_limite_depot: daysFromNow(-50), date_ouverture_plis: daysFromNow(-49),
            date_attribution: daysFromNow(-30), fournisseur_attributaire: "Agadir Bureau Équipements",
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

        await initChecklist(ref, "AO", result.insertId, "ETAPE_CHECKLIST_AO", ao.etat);

        console.log(`  ${ao.numero_ao} — ${ao.etat}`);
    }
    console.log("");
    return ids;
}

async function seedOffres(ref, aoIds, fournisseurIds) {
    console.log("Création des offres...");
    const offres = [
        { ao: "AO-2026-002", fournisseur: "Atlas BTP", montant: 1150000, statut: "ADMISSIBLE", date: daysFromNow(-21) },
        { ao: "AO-2026-002", fournisseur: "Souss Construction", montant: 1180000, statut: "ADMISSIBLE", date: daysFromNow(-20) },
        { ao: "AO-2026-002", fournisseur: "Anza Travaux Publics", montant: 1290000, statut: "REJETEE", date: daysFromNow(-20) },
        { ao: "AO-2026-003", fournisseur: "TechnoSoft Maroc", montant: 375000, statut: "RETENUE", date: daysFromNow(-90) },
        { ao: "AO-2026-003", fournisseur: "InfoSystème SARL", montant: 390000, statut: "REJETEE", date: daysFromNow(-89) },
        { ao: "AO-2026-003", fournisseur: "DataCore Solutions", montant: 405000, statut: "REJETEE", date: daysFromNow(-89) },
        { ao: "AO-2026-004", fournisseur: "ConsultPro Services", montant: 215000, statut: "RETENUE", date: daysFromNow(-110) },
        { ao: "AO-2026-004", fournisseur: "Maroc Audit & Conseil", montant: 225000, statut: "REJETEE", date: daysFromNow(-109) },
        { ao: "AO-2026-006", fournisseur: "Atlas BTP", montant: 2350000, statut: "RETENUE", date: daysFromNow(-170) },
        { ao: "AO-2026-006", fournisseur: "Souss Construction", montant: 2410000, statut: "REJETEE", date: daysFromNow(-169) },
        { ao: "AO-2026-007", fournisseur: "Sud Fournitures", montant: 700000, statut: "REJETEE", date: daysFromNow(-70) },
        { ao: "AO-2026-008", fournisseur: "InfoSystème SARL", montant: 145000, statut: "RECUE", date: daysFromNow(-9) },
        { ao: "AO-2026-008", fournisseur: "DataCore Solutions", montant: 152000, statut: "RECUE", date: daysFromNow(-9) },
        { ao: "AO-2026-010", fournisseur: "Agadir Bureau Équipements", montant: 305000, statut: "RETENUE", date: daysFromNow(-50) },
        { ao: "AO-2026-010", fournisseur: "Sud Fournitures", montant: 318000, statut: "REJETEE", date: daysFromNow(-49) },
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
            montant: 375000, date_notification: daysFromNow(-65), date_debut: daysFromNow(-60), date_fin: daysFromNow(150),
            delai_execution_jours: 210, date_prochaine_echeance: daysFromNow(150),
        },
        {
            numero: "M-2026-002", objet: "Prestations d'audit organisationnel",
            type_marche: "FERME", statut: "NOTIFIE", fournisseur: "ConsultPro Services", ao: "AO-2026-004",
            montant: 215000, date_notification: daysFromNow(-90), date_debut: daysFromNow(-85), date_fin: daysFromNow(90),
            delai_execution_jours: 175, date_prochaine_echeance: daysFromNow(5),
        },
        {
            numero: "M-2026-003", objet: "Construction d'un canal d'irrigation — secteur Nord",
            type_marche: "FERME", statut: "EN_COURS", fournisseur: "Atlas BTP", ao: "AO-2026-006",
            montant: 2350000, date_notification: daysFromNow(-145), date_debut: daysFromNow(-140), date_fin: daysFromNow(280),
            delai_execution_jours: 420, date_prochaine_echeance: daysFromNow(20),
        },
        {
            numero: "M-2026-004", objet: "Fourniture d'équipements de bureau",
            type_marche: "FERME", statut: "NOTIFIE", fournisseur: "Agadir Bureau Équipements", ao: "AO-2026-010",
            montant: 305000, date_notification: daysFromNow(-25), date_debut: daysFromNow(-20), date_fin: daysFromNow(60),
            delai_execution_jours: 80, date_prochaine_echeance: daysFromNow(45),
        },
        {
            numero: "M-2025-018", objet: "Maintenance du réseau informatique du siège",
            type_marche: "RECONDUCTIBLE", statut: "ACHEVE", fournisseur: "InfoSystème SARL", ao: null,
            montant: 160000, date_notification: daysFromNow(-330), date_debut: daysFromNow(-325), date_fin: daysFromNow(-120),
            delai_execution_jours: 205, date_reception_provisoire: daysFromNow(-125), date_reception_definitive: daysFromNow(-118),
            date_prochaine_echeance: null,
        },
        {
            numero: "M-2026-005", objet: "Fourniture de consommables de bureau",
            type_marche: "FERME", statut: "RESILIE", fournisseur: "Sud Fournitures", ao: null,
            montant: 85000, date_notification: daysFromNow(-200), date_debut: daysFromNow(-195), date_fin: daysFromNow(-30),
            delai_execution_jours: 165, date_prochaine_echeance: null,
        },
        {
            numero: "M-2026-006", objet: "Licence logicielle de gestion documentaire",
            type_marche: "CADRE", statut: "EXPIRE", fournisseur: "DataCore Solutions", ao: null,
            montant: 98000, date_notification: daysFromNow(-400), date_debut: daysFromNow(-395), date_fin: daysFromNow(-10),
            delai_execution_jours: 385, date_prochaine_echeance: null,
        },
        {
            numero: "M-2026-007", objet: "Réfection de la clôture du siège régional",
            type_marche: "FERME", statut: "SUSPENDU", fournisseur: "Souss Construction", ao: null,
            montant: 120000, date_notification: daysFromNow(-50), date_debut: daysFromNow(-45), date_fin: daysFromNow(200),
            delai_execution_jours: 245, date_prochaine_echeance: daysFromNow(2),
        },
        {
            numero: "M-2026-008", objet: "Entretien des espaces verts — contrat pluriannuel",
            type_marche: "RECONDUCTIBLE", statut: "RENOUVELE", fournisseur: "Anza Travaux Publics", ao: null,
            montant: 540000, date_notification: daysFromNow(-500), date_debut: daysFromNow(-495), date_fin: daysFromNow(365),
            delai_execution_jours: 860, date_prochaine_echeance: daysFromNow(300),
        },
        {
            numero: "M-2026-009", objet: "Diagnostic organisationnel complémentaire",
            type_marche: "CADRE", statut: "EN_COURS", fournisseur: "Maroc Audit & Conseil", ao: null,
            montant: 65000, date_notification: daysFromNow(-15), date_debut: daysFromNow(-10), date_fin: daysFromNow(9),
            delai_execution_jours: 19, date_prochaine_echeance: daysFromNow(9),
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

        await initChecklist(ref, "MARCHE", result.insertId, "ETAPE_CHECKLIST_MARCHE", m.statut);

        console.log(`  ${m.numero} — ${m.statut}`);
    }
    console.log("");
    return ids;
}

async function initChecklist(ref, typeEntite, entiteId, etapeTypeRef, statutActuel) {
    const [steps] = await pool.execute(
        `SELECT id_ref, code FROM referentiels WHERE type_referentiel = ? AND actif = 1 ORDER BY ordre_affichage ASC`,
        [etapeTypeRef]
    );

    const progressionParStatut = {
        BROUILLON: 0, PUBLIE: 2, OUVERTURE_PLIS: 4, EN_EVALUATION: 6, ATTRIBUE: steps.length, INFRUCTUEUX: 3, ANNULE: 1,
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
                isDone ? daysFromNow(-30) : null,
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
        console.log("\nChangez ces mots de passe si cette base sert au-delà de vos tests locaux.");

        process.exit(0);
    } catch (err) {
        console.error("Erreur lors du reseed:", err);
        process.exit(1);
    }
}

seed();