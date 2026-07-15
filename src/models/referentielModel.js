// src/models/referentielModel.js
const pool = require("../../config/db.js");

const Referentiel = {
  async getByType(type) {
    const query = `
            SELECT id_ref, code, libelle, ordre_affichage, actif 
            FROM referentiels 
            WHERE type_referentiel = ? AND actif = 1
            ORDER BY ordre_affichage ASC, libelle ASC
        `;

    const [rows] = await pool.execute(query, [type]);
    return rows;
  },

  async getProfiles() {
    return await this.getByType("ROLE");
  },
  async getStatutsAO() {
    return await this.getByType("ETAT_AO");
  },

  async getById(id_ref) {
    const query = `
            SELECT id_ref, type_referentiel, code, libelle, ordre_affichage, actif 
            FROM referentiels 
            WHERE id_ref = ?
        `;
    const [rows] = await pool.execute(query, [id_ref]);
    return rows[0] || null;
  },

  async getAll() {
    const query = `
            SELECT id_ref, type_referentiel, code, libelle, ordre_affichage, actif 
            FROM referentiels 
            ORDER BY type_referentiel ASC, ordre_affichage ASC, libelle ASC
        `;
    const [rows] = await pool.execute(query);
    return rows;
  },

  async create(refData) {
    const { type_referentiel, code, libelle, ordre_affichage } = refData;
    const query = `
            INSERT INTO referentiels (type_referentiel, code, libelle, ordre_affichage, actif)
            VALUES (?, ?, ?, ?, 1)
        `;

    // Using upper-case conversion for types and codes keeps structural filtering clean
    const [result] = await pool.execute(query, [
      type_referentiel.toUpperCase(),
      code.toUpperCase(),
      libelle,
      ordre_affichage || 0,
    ]);
    return result.insertId; // Returns the newly generated id_ref
  },

  async update(id_ref, updateData) {
    const { code, libelle, ordre_affichage, actif } = updateData;
    const query = `
            UPDATE referentiels 
            SET code = ?, libelle = ?, ordre_affichage = ?, actif = ?
            WHERE id_ref = ?
        `;

    const [result] = await pool.execute(query, [
      code.toUpperCase(),
      libelle,
      ordre_affichage || 0,
      actif,
      id_ref,
    ]);
    return result.affectedRows > 0; // Returns true if a row was updated
  },
};

module.exports = Referentiel;
