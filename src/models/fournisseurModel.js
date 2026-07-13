const pool = require('../../config/db.js');

const Fournisseur = {
    async create(fournisseurData) {
        const { raison_sociale, ice, adresse, telephone, email, contact, domaine_activite_id, actif } = fournisseurData;
        const query = `
            INSERT INTO fournisseurs (raison_sociale, ice, adresse, telephone, email, contact, domaine_activite_id, actif)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.execute(query, [
            raison_sociale,
            ice,
            adresse || null,
            telephone || null,
            email || null,
            contact || null,
            domaine_activite_id,
            actif !== undefined ? actif : 1
        ]);
        return result.insertId;
    },

    async getById(id_fournisseur) {
        const query = `
            SELECT f.*, r.libelle AS domaine_activite_libelle
            FROM fournisseurs f
            INNER JOIN referentiels r ON f.domaine_activite_id = r.id_ref
            WHERE f.id_fournisseur = ?
        `;
        
        const [rows] = await pool.execute(query, [id_fournisseur]);
        return rows[0] || null;
    },

    async getByIce(ice) {
        const query = `
            SELECT f.*, r.libelle AS domaine_activite_libelle
            FROM fournisseurs f
            INNER JOIN referentiels r ON f.domaine_activite_id = r.id_ref
            WHERE f.ice = ?
            LIMIT 1
        `;
        
        const [rows] = await pool.execute(query, [ice]);
        return rows[0] || null;
    },

    async getAll() {
        const query = `
            SELECT f.*, r.libelle AS domaine_activite_libelle
            FROM fournisseurs f
            INNER JOIN referentiels r ON f.domaine_activite_id = r.id_ref
            ORDER BY f.raison_sociale ASC
        `;
        
        const [rows] = await pool.execute(query);
        return rows;
    },

    async getByDomaine(domaine_activite_id) {
        const query = `
            SELECT f.*, r.libelle AS domaine_activite_libelle
            FROM fournisseurs f
            INNER JOIN referentiels r ON f.domaine_activite_id = r.id_ref
            WHERE f.domaine_activite_id = ? AND f.actif = 1
            ORDER BY f.raison_sociale ASC
        `;
        
        const [rows] = await pool.execute(query, [domaine_activite_id]);
        return rows;
    },

    async update(id_fournisseur, updateData) {
        const { raison_sociale, ice, adresse, telephone, email, contact, domaine_activite_id, actif } = updateData;
        const query = `
            UPDATE fournisseurs 
            SET raison_sociale = ?, ice = ?, adresse = ?, telephone = ?, email = ?, contact = ?, domaine_activite_id = ?, actif = ?, date_modification = NOW()
            WHERE id_fournisseur = ?
        `;
        
        const [result] = await pool.execute(query, [
            raison_sociale,
            ice,
            adresse || null,
            telephone || null,
            email || null,
            contact || null,
            domaine_activite_id,
            actif,
            id_fournisseur
        ]);
        return result.affectedRows > 0;
    }
};

module.exports = Fournisseur;