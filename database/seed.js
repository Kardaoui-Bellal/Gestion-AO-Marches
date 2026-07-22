require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const pool = require("../config/db");

async function seed() {
    try {
        console.log("Démarrage du seed de données de démonstration...");

        const [domaineRows] = await pool.execute(
            `SELECT id_ref FROM referentiels WHERE type_referentiel = 'DOMAINE_ACTIVITE' AND code = 'IT' LIMIT 1`
        );

        if (domaineRows.length === 0) {
            console.error("Référentiel DOMAINE_ACTIVITE/IT introuvable. Exécutez referentiels_seed.sql d'abord.");
            process.exit(1);
        }

        const domaine_id = domaineRows[0].id_ref;

        const fournisseursDemo = [
            { raison_sociale: "TechnoSoft Maroc", ice: "001234567000012", email: "contact@technosoft.ma", telephone: "0522000001" },
            { raison_sociale: "InfoSystème SARL", ice: "001234567000029", email: "contact@infosysteme.ma", telephone: "0522000002" },
        ];

        for (const f of fournisseursDemo) {
            const [existing] = await pool.execute(
                `SELECT id_fournisseur FROM fournisseurs WHERE ice = ? LIMIT 1`,
                [f.ice]
            );

            if (existing.length > 0) {
                console.log(`Fournisseur "${f.raison_sociale}" existe déjà — ignoré.`);
                continue;
            }

            await pool.execute(
                `INSERT INTO fournisseurs (raison_sociale, ice, email, telephone, domaine_activite_id, actif) VALUES (?, ?, ?, ?, ?, 1)`,
                [f.raison_sociale, f.ice, f.email, f.telephone, domaine_id]
            );

            console.log(`Fournisseur "${f.raison_sociale}" créé.`);
        }

        console.log("Seed terminé.");
        process.exit(0);
    } catch (err) {
        console.error("Erreur lors du seed:", err);
        process.exit(1);
    }
}

seed();