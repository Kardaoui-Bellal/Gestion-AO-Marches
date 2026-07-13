const pool = require('../../config/db.js');

const Utilisateur = {
    async create(userData) {
        const { nom, email, mot_de_passe_hash, profil_id } = userData;
        const query = `
            INSERT INTO utilisateurs (nom, email, mot_de_passe_hash, profil_id, actif) 
            VALUES (?, ?, ?, ?, 1)
        `;
        
        const [result] = await pool.execute(query, [nom, email, mot_de_passe_hash, profil_id]);
        return result.insertId; // Returns the generated id_utilisateur
    },

    async findByEmail(email) {
        const query = `
            SELECT id_utilisateur, nom, email, mot_de_passe_hash, profil_id, actif 
            FROM utilisateurs 
            WHERE email = ? 
            LIMIT 1
        `;
        
        const [rows] = await pool.execute(query, [email]);
        return rows[0] || null;
    },

    async findById(id_utilisateur) {
        const query = `
            SELECT id_utilisateur, nom, email, profil_id, actif, date_creation, date_modification 
            FROM utilisateurs 
            WHERE id_utilisateur = ?
        `;
        
        const [rows] = await pool.execute(query, [id_utilisateur]);
        return rows[0] || null;
    },

    async getAll() {
        const query = `
            SELECT id_utilisateur, nom, email, profil_id, actif, date_creation 
            FROM utilisateurs 
            ORDER BY date_creation DESC
        `;
        
        const [rows] = await pool.execute(query);
        return rows;
    },

    async update(id_utilisateur, updateData) {
        const { nom, profil_id, actif } = updateData;
        const query = `
            UPDATE utilisateurs 
            SET nom = ?, profil_id = ?, actif = ?, date_modification = NOW() 
            WHERE id_utilisateur = ?
        `;
        
        const [result] = await pool.execute(query, [nom, profil_id, actif, id_utilisateur]);
        return result.affectedRows > 0;
    },

    async updatePassword(id_utilisateur, hashedNewPassword) {
        const query = `
            UPDATE utilisateurs 
            SET mot_de_passe_hash = ?, date_modification = NOW() 
            WHERE id_utilisateur = ?
        `;
        
        const [result] = await pool.execute(query, [hashedNewPassword, id_utilisateur]);
        return result.affectedRows > 0;
    }
};

module.exports = Utilisateur;