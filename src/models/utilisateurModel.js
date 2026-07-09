const pool = require('../config/db');
const bcrypt = require('bcrypt');

const userModel = {
  // Recherche un utilisateur actif par email (utilisé lors du login)
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = ? AND actif = 1',
      [email]
    );
    return rows[0] || null;
  },

  // Recherche par id (utile pour recharger l'utilisateur en session si besoin)
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, nom_complet, email, role, actif FROM utilisateurs WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Compare le mot de passe saisi avec le hash stocké
  async verifierMotDePasse(motDePasseSaisi, hash) {
    return bcrypt.compare(motDePasseSaisi, hash);
  },

  // Crée un nouvel utilisateur avec mot de passe haché (utilisé par scripts/createUser.js)
  async creerUtilisateur({ nomComplet, email, motDePasse, role = 'consultation' }) {
    const hash = await bcrypt.hash(motDePasse, 10);
    const [result] = await pool.query(
      'INSERT INTO utilisateurs (nom_complet, email, mot_de_passe, role) VALUES (?, ?, ?, ?)',
      [nomComplet, email, hash, role]
    );
    return result.insertId;
  }
};

module.exports = userModel;
