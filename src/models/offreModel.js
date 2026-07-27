const pool = require('../../config/db.js');

const Offre = {
    async create(offreData) {
        const { appel_offre_id, fournisseur_id, montant_propose, date_soumission, statut_id } = offreData;
        const query = `
            INSERT INTO offres (appel_offre_id, fournisseur_id, montant_propose, date_soumission, statut_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.execute(query, [
            appel_offre_id, 
            fournisseur_id, 
            montant_propose, 
            date_soumission || null, 
            statut_id
        ]);
        return result.insertId;
    },

    async getById(id_offre) {
        const query = `
            SELECT o.*, 
                   ao.objet AS appel_offre_objet, 
                   f.raison_sociale AS fournisseur_nom,
                   r.libelle AS statut_libelle
            FROM offres o
            INNER JOIN appels_offres ao ON o.appel_offre_id = ao.id_ao
            INNER JOIN fournisseurs f ON o.fournisseur_id = f.id_fournisseur
            INNER JOIN referentiels r ON o.statut_id = r.id_ref
            WHERE o.id_offre = ?
        `;
        
        const [rows] = await pool.execute(query, [id_offre]);
        return rows[0] || null;
    },

    async getByAppelOffre(appel_offre_id) {
        const query = `
            SELECT o.id_offre, o.montant_propose, o.date_soumission, o.date_creation,
                   f.raison_sociale AS fournisseur_nom,
                   r.libelle AS statut_libelle,
                   r.code AS statut_code
            FROM offres o
            INNER JOIN fournisseurs f ON o.fournisseur_id = f.id_fournisseur
            INNER JOIN referentiels r ON o.statut_id = r.id_ref
            WHERE o.appel_offre_id = ?
            ORDER BY o.montant_propose ASC
        `;
        
        const [rows] = await pool.execute(query, [appel_offre_id]);
        return rows;
    },

    async getByFournisseur(fournisseur_id) {
        const query = `
            SELECT o.id_offre, o.montant_propose, o.date_soumission,
                   ao.objet AS appel_offre_objet,
                   r.libelle AS statut_libelle
            FROM offres o
            INNER JOIN appels_offres ao ON o.appel_offre_id = ao.id_appel_offre
            INNER JOIN referentiels r ON o.statut_id = r.id_ref
            WHERE o.fournisseur_id = ?
            ORDER BY o.date_soumission DESC
        `;
        
        const [rows] = await pool.execute(query, [fournisseur_id]);
        return rows;
    },

    async update(id_offre, updateData) {
        const { montant_propose, date_soumission, statut_id } = updateData;
        const query = `
            UPDATE offres 
            SET montant_propose = ?, date_soumission = ?, statut_id = ?, date_modification = NOW()
            WHERE id_offre = ?
        `;
        
        const [result] = await pool.execute(query, [montant_propose, date_soumission, statut_id, id_offre]);
        return result.affectedRows > 0;
    },

    async updateStatus(id_offre, statut_id) {
        const query = `
            UPDATE offres 
            SET statut_id = ?, date_modification = NOW()
            WHERE id_offre = ?
        `;
        
        const [result] = await pool.execute(query, [statut_id, id_offre]);
        return result.affectedRows > 0;
    }
};

module.exports = Offre;