const pool = require('../../config/db.js');

const Document = {
    async create(documentData) {
        const {
            type_entite, entite_id, type_document_id, nom_original,
            nom_stocke, chemin_dossier, taille, mime_type, observation
        } = documentData;

        const query = `
            INSERT INTO documents (
                type_entite, entite_id, type_document_id, nom_original, 
                nom_stocke, chemin_dossier, taille, mime_type, observation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(query, [
            type_entite,
            entite_id,
            type_document_id,
            nom_original,
            nom_stocke,
            chemin_dossier,
            taille || null,
            mime_type || null,
            observation || null
        ]);
        return result.insertId;
    },

    async getById(id_document) {
        const query = `
            SELECT d.*, r.libelle AS type_document_libelle
            FROM documents d
            INNER JOIN referentiels r ON d.type_document_id = r.id_ref
            WHERE d.id_document = ?
        `;

        const [rows] = await pool.execute(query, [id_document]);
        return rows[0] || null;
    },

    async getByEntity(type_entite, entite_id) {
        const query = `
            SELECT d.*, r.libelle AS type_document_libelle
            FROM documents d
            INNER JOIN referentiels r ON d.type_document_id = r.id_ref
            WHERE d.type_entite = ? AND d.entite_id = ?
            ORDER BY d.date_ajout DESC
        `;

        const [rows] = await pool.execute(query, [type_entite, entite_id]);
        return rows;
    },

    async getByAppelOffre(id_appel_offre) {
        return await this.getByEntity('AO', id_appel_offre);
    },

    async getByMarche(id_marche) {
        return await this.getByEntity('MARCHE', id_marche);
    },

    async archive(id_document, archiveObservation) {
        const query = `
            UPDATE documents 
            SET observation = ? 
            WHERE id_document = ?
        `;
        
        const [result] = await pool.execute(query, [
            archiveObservation || 'Archivé', 
            id_document
        ]);
        return result.affectedRows > 0;
    }
};

module.exports = Document;