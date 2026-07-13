const pool = require('../../config/db.js');

const Checklist = {
    async create(checklistData) {
        const { type_entite, appel_offre_id, marche_id, etape_id, statut_id, date_validation, observation } = checklistData;
        const query = `
            INSERT INTO checklist (type_entite, appel_offre_id, marche_id, etape_id, statut_id, date_validation, observation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(query, [
            type_entite,
            type_entite === 'AO' ? appel_offre_id : null,
            type_entite === 'MARCHE' ? marche_id : null,
            etape_id,
            statut_id,
            date_validation || null,
            observation || null
        ]);
        return result.insertId;
    },

    async getById(id_checklist) {
        const query = `
            SELECT c.*,
                   r_etape.libelle AS etape_libelle,
                   r_etape.code AS etape_code,
                   r_statut.libelle AS statut_libelle,
                   r_statut.code AS statut_code
            FROM checklist c
            INNER JOIN referentiels r_etape ON c.etape_id = r_etape.id_ref
            INNER JOIN referentiels r_statut ON c.statut_id = r_statut.id_ref
            WHERE c.id_checklist = ?
        `;

        const [rows] = await pool.execute(query, [id_checklist]);
        return rows[0] || null;
    },

    async getByEntity(type_entite, entite_id) {
        const targetColumn = type_entite === 'AO' ? 'c.appel_offre_id' : 'c.marche_id';
        const query = `
            SELECT c.*,
                   r_etape.libelle AS etape_libelle,
                   r_etape.code AS etape_code,
                   r_etape.ordre_affichage AS etape_ordre,
                   r_statut.libelle AS statut_libelle,
                   r_statut.code AS statut_code
            FROM checklist c
            INNER JOIN referentiels r_etape ON c.etape_id = r_etape.id_ref
            INNER JOIN referentiels r_statut ON c.statut_id = r_statut.id_ref
            WHERE c.type_entite = ? AND ${targetColumn} = ?
            ORDER BY r_etape.ordre_affichage ASC
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

    async update(id_checklist, updateData) {
        const { statut_id, date_validation, observation } = updateData;
        const query = `
            UPDATE checklist 
            SET statut_id = ?, date_validation = ?, observation = ?
            WHERE id_checklist = ?
        `;

        const [result] = await pool.execute(query, [
            statut_id,
            date_validation || null,
            observation || null,
            id_checklist
        ]);
        return result.affectedRows > 0;
    },

    async initForEntity(type_entite, entite_id, etapeTypeRef, defaultStatutId) {
        const querySteps = `
            SELECT id_ref 
            FROM referentiels 
            WHERE type_referentiel = ? AND actif = 1
        `;
        const [steps] = await pool.execute(querySteps, [etapeTypeRef]);

        if (steps.length === 0) return false;

        const insertQuery = `
            INSERT INTO checklist (type_entite, appel_offre_id, marche_id, etape_id, statut_id)
            VALUES (?, ?, ?, ?, ?)
        `;

        for (const step of steps) {
            await pool.execute(insertQuery, [
                type_entite,
                type_entite === 'AO' ? entite_id : null,
                type_entite === 'MARCHE' ? entite_id : null,
                step.id_ref,
                defaultStatutId
            ]);
        }
        return true;
    }
};

module.exports = Checklist;