const pool = require('../../config/db.js');

const AppelOffre = {
    async create(aoData) {
        const {
            numero_ao, objet, categorie_id, etat_id, montant_estimatif,
            date_lancement, date_limite_depot, date_ouverture_plis,
            date_attribution, fournisseur_attributaire_id, observation
        } = aoData;

        const query = `
            INSERT INTO appels_offres (
                numero_ao, objet, categorie_id, etat_id, montant_estimatif,
                date_lancement, date_limite_depot, date_ouverture_plis,
                date_attribution, fournisseur_attributaire_id, observation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(query, [
            numero_ao,
            objet,
            categorie_id,
            etat_id,
            montant_estimatif,
            date_lancement || null,
            date_limite_depot || null,
            date_ouverture_plis || null,
            date_attribution || null,
            fournisseur_attributaire_id || null,
            observation || null
        ]);
        return result.insertId;
    },

    async getById(id_ao) {
        const query = `
            SELECT ao.*,
                   r_cat.libelle AS categorie_libelle,
                   r_cat.code AS categorie_code,
                   r_etat.libelle AS etat_libelle,
                   r_etat.code AS etat_code,
                   f.nom AS fournisseur_nom
            FROM appels_offres ao
            INNER JOIN referentiels r_cat ON ao.categorie_id = r_cat.id_ref
            INNER JOIN referentiels r_etat ON ao.etat_id = r_etat.id_ref
            LEFT JOIN fournisseurs f ON ao.fournisseur_attributaire_id = f.id_fournisseur
            WHERE ao.id_ao = ?
        `;

        const [rows] = await pool.execute(query, [id_ao]);
        return rows[0] || null;
    },

    async getAll() {
        const query = `
            SELECT ao.*,
                   r_cat.libelle AS categorie_libelle,
                   r_etat.libelle AS etat_libelle,
                   f.nom AS fournisseur_nom
            FROM appels_offres ao
            INNER JOIN referentiels r_cat ON ao.categorie_id = r_cat.id_ref
            INNER JOIN referentiels r_etat ON ao.etat_id = r_etat.id_ref
            LEFT JOIN fournisseurs f ON ao.fournisseur_attributaire_id = f.id_fournisseur
            ORDER BY ao.date_creation DESC
        `;

        const [rows] = await pool.execute(query);
        return rows;
    },

    async update(id_ao, updateData) {
        const {
            numero_ao, objet, categorie_id, etat_id, montant_estimatif,
            date_lancement, date_limite_depot, date_ouverture_plis,
            date_attribution, fournisseur_attributaire_id, observation
        } = updateData;

        const query = `
            UPDATE appels_offres
            SET numero_ao = ?,
                objet = ?,
                categorie_id = ?,
                etat_id = ?,
                montant_estimatif = ?,
                date_lancement = ?,
                date_limite_depot = ?,
                date_ouverture_plis = ?,
                date_attribution = ?,
                fournisseur_attributaire_id = ?,
                observation = ?,
                date_modification = NOW()
            WHERE id_ao = ?
        `;

        const [result] = await pool.execute(query, [
            numero_ao,
            objet,
            categorie_id,
            etat_id,
            montant_estimatif,
            date_lancement || null,
            date_limite_depot || null,
            date_ouverture_plis || null,
            date_attribution || null,
            fournisseur_attributaire_id || null,
            observation || null,
            id_ao
        ]);
        return result.affectedRows > 0;
    }
};

module.exports = AppelOffre;