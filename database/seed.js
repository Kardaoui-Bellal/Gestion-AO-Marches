/**
 * Étape 0.3 - Page Connexion
 * Insère 1 utilisateur administrateur de test avec mot de passe haché (bcrypt).
 * Usage : npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seedAdmin() {
  const login = process.env.ADMIN_LOGIN || 'admin';
  const motDePasseClair = process.env.ADMIN_PASSWORD || 'Admin@2026';
  const nom = process.env.ADMIN_NOM || 'Administrateur Bureau Informatique';

  try {
    const [existant] = await pool.query(
      'SELECT id_utilisateur FROM utilisateurs WHERE login = ?',
      [login]
    );

    if (existant.length > 0) {
      console.log(`L'utilisateur "${login}" existe déjà. Aucune action effectuée.`);
      process.exit(0);
    }

    const saltRounds = 10;
    const motDePasseHache = await bcrypt.hash(motDePasseClair, saltRounds);

    await pool.query(
      `INSERT INTO utilisateurs (nom, login, mot_de_passe, profil, actif)
       VALUES (?, ?, ?, 'Administrateur', TRUE)`,
      [nom, login, motDePasseHache]
    );

    console.log('Compte administrateur de test créé avec succès :');
    console.log(`  Login       : ${login}`);
    console.log(`  Mot de passe: ${motDePasseClair}`);
    console.log('Pensez à changer ce mot de passe après la première connexion.');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur :', error);
    process.exit(1);
  }
}

seedAdmin();
