const pool = require('../../config/db.js');

const Historique = {
    async log(logData) {
        const {
            utilisateur_id, action, entite_type, entite_id,
            champ_modifie, ancienne_valeur, nouvelle_valeur, details
        } = logData;

        const query = `
            INSERT INTO historique (
                utilisateur_id, action, entite_type, entite_id, 
                champ_modifie, ancienne_valeur, nouvelle_valeur, details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(query, [
            utilisateur_id,
            action,
            entite_type,
            entite_id,
            champ_modifie || null,
            ancienne_valeur || null,
            nouvelle_valeur || null,
            details || null
        ]);
        return result.insertId;
    },

    async getAll() {
        const query = `
            SELECT h.*, u.nom AS utilisateur_nom, u.email AS utilisateur_email
            FROM historique h
            INNER JOIN utilisateurs u ON h.utilisateur_id = u.id_utilisateur
            ORDER BY h.date_action DESC
        `;

        const [rows] = await pool.execute(query);
        return rows;
    },

    async getByEntity(entite_type, entite_id) {
        const query = `
            SELECT h.*, u.nom AS utilisateur_nom
            FROM historique h
            INNER JOIN utilisateurs u ON h.utilisateur_id = u.id_utilisateur
            WHERE h.entite_type = ? AND h.entite_id = ?
            ORDER BY h.date_action DESC
        `;

        const [rows] = await pool.execute(query, [entite_type, entite_id]);
        return rows;
    },

    async getByUtilisateur(utilisateur_id) {
        const query = `
            SELECT h.* 
            FROM historique h
            WHERE h.utilisateur_id = ?
            ORDER BY h.date_action DESC
        `;

        const [rows] = await pool.execute(query, [utilisateur_id]);
        return rows;
    }
};

module.exports = Historique;