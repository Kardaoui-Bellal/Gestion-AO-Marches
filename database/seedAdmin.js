require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function seedAdmin() {
    const nom = "Administrateur Principal";
    const email = "admin@ormvasm.ma"; // change to your real email
    const plainPassword = "ChangeMoi123!"; // CHANGE THIS after first login

    try {
        // Find the ADMIN role id from referentiels
        const [roleRows] = await pool.execute(
            `SELECT id_ref FROM referentiels WHERE type_referentiel = 'ROLE' AND code = 'ADMIN' LIMIT 1`
        );

        if (roleRows.length === 0) {
            console.error("Aucun rôle ADMIN trouvé dans referentiels. Avez-vous exécuté referentiels_seed.sql ?");
            process.exit(1);
        }

        const profil_id = roleRows[0].id_ref;

        // Check if this admin already exists
        const [existing] = await pool.execute(
            `SELECT id_utilisateur FROM utilisateurs WHERE email = ? LIMIT 1`,
            [email]
        );

        if (existing.length > 0) {
            console.log("Un utilisateur avec cet email existe déjà. Aucune action effectuée.");
            process.exit(0);
        }

        const hash = await bcrypt.hash(plainPassword, 10);

        const [result] = await pool.execute(
            `INSERT INTO utilisateurs (nom, email, mot_de_passe_hash, profil_id, actif) VALUES (?, ?, ?, ?, 1)`,
            [nom, email, hash, profil_id]
        );

        console.log(`Admin créé avec succès. id_utilisateur = ${result.insertId}`);
        console.log(`Email: ${email}`);
        console.log(`Mot de passe temporaire: ${plainPassword}`);
        console.log("⚠️  Changez ce mot de passe après la première connexion.");

        process.exit(0);
    } catch (err) {
        console.error("Erreur lors de la création de l'admin:", err);
        process.exit(1);
    }
}

seedAdmin();