const pool = require('../../config/db.js');

const Marche = {
    async create(marcheData) {
        const {
            numero, objet, type_marche_id, statut_id, fournisseur_id,
            appel_offre_id, montant, date_notification, date_debut, date_fin,
            delai_execution_jours, date_reception_provisoire, date_reception_definitive,
            date_prochaine_echeance, observation
        } = marcheData;

        const query = `
            INSERT INTO marches (
                numero, objet, type_marche_id, statut_id, fournisseur_id, 
                appel_offre_id, montant, date_notification, date_debut, date_fin, 
                delai_execution_jours, date_reception_provisoire, date_reception_definitive, 
                date_prochaine_echeance, observation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(query, [
            numero, objet, type_marche_id, statut_id, fournisseur_id,
            appel_offre_id || null, montant, date_notification || null, date_debut || null, date_fin || null,
            delai_execution_jours || null, date_reception_provisoire || null, date_reception_definitive || null,
            date_prochaine_echeance || null, observation || null
        ]);
        return result.insertId;
    },

    async getById(id_marche) {
        const query = `
            SELECT m.*, 
                   f.raison_sociale AS fournisseur_nom,
                   r_type.libelle AS type_marche_libelle,
                   r_statut.libelle AS statut_libelle
            FROM marches m
            INNER JOIN fournisseurs f ON m.fournisseur_id = f.id_fournisseur
            INNER JOIN referentiels r_type ON m.type_marche_id = r_type.id_ref
            INNER JOIN referentiels r_statut ON m.statut_id = r_statut.id_ref
            WHERE m.id_marche = ?
        `;

        const [rows] = await pool.execute(query, [id_marche]);
        return rows[0] || null;
    },

    async getAll() {
        const query = `
            SELECT m.id_marche, m.numero, m.objet, m.montant, m.date_debut, m.date_fin,
                   f.raison_sociale AS fournisseur_nom,
                   r_type.libelle AS type_marche_libelle,
                   r_statut.libelle AS statut_libelle,
                   ao.numero_ao AS numero_ao
            FROM marches m
            INNER JOIN fournisseurs f ON m.fournisseur_id = f.id_fournisseur
            INNER JOIN referentiels r_type ON m.type_marche_id = r_type.id_ref
            INNER JOIN referentiels r_statut ON m.statut_id = r_statut.id_ref
            LEFT JOIN appels_offres ao ON m.appel_offre_id = ao.id_ao
            ORDER BY m.date_creation DESC
        `;

        const [rows] = await pool.execute(query);
        return rows;
    },

    async getByFournisseur(fournisseur_id) {
        const query = `
            SELECT m.id_marche, m.numero, m.objet, m.montant, r_statut.libelle AS statut_libelle
            FROM marches m
            INNER JOIN referentiels r_statut ON m.statut_id = r_statut.id_ref
            WHERE m.fournisseur_id = ?
            ORDER BY m.date_creation DESC
        `;

        const [rows] = await pool.execute(query, [fournisseur_id]);
        return rows;
    },

    async getByFilters(filters = {}) {
        const { type_marche_id, statut_id, is_inactive } = filters;
        
        let query = `
            SELECT m.id_marche, m.numero, m.objet, m.montant, m.date_debut, m.date_fin,
                   f.raison_sociale AS fournisseur_nom,
                   r_type.libelle AS type_marche_libelle,
                   r_statut.libelle AS statut_libelle,
                   ao.numero_ao AS numero_ao
            FROM marches m
            INNER JOIN fournisseurs f ON m.fournisseur_id = f.id_fournisseur
            INNER JOIN referentiels r_type ON m.type_marche_id = r_type.id_ref
            INNER JOIN referentiels r_statut ON m.statut_id = r_statut.id_ref
            LEFT JOIN appels_offres ao ON m.appel_offre_id = ao.id_ao
            WHERE 1=1
        `;
        
        const params = [];

        if (type_marche_id) {
            query += ` AND m.type_marche_id = ?`;
            params.push(type_marche_id);
        }

        if (statut_id) {
            query += ` AND m.statut_id = ?`;
            params.push(statut_id);
        }

        if (is_inactive === true) {
            query += ` AND r_statut.code IN ('CLOTURE', 'RESILIE', 'ANNULE')`;
        } else if (is_inactive === false) {
            query += ` AND r_statut.code NOT IN ('CLOTURE', 'RESILIE', 'ANNULE')`;
        }

        query += ` ORDER BY m.date_creation DESC`;

        const [rows] = await pool.execute(query, params);
        return rows;
    },
    
    async getEcheancesProches(daysAhead) {
    const query = `
        SELECT m.id_marche, m.numero, m.objet, m.montant, m.date_prochaine_echeance,
               f.raison_sociale AS fournisseur_nom,
               r_type.libelle AS type_marche_libelle,
               r_statut.libelle AS statut_libelle
        FROM marches m
        INNER JOIN fournisseurs f ON m.fournisseur_id = f.id_fournisseur
        INNER JOIN referentiels r_type ON m.type_marche_id = r_type.id_ref
        INNER JOIN referentiels r_statut ON m.statut_id = r_statut.id_ref
        WHERE m.date_prochaine_echeance IS NOT NULL
          AND m.date_prochaine_echeance BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
        ORDER BY m.date_prochaine_echeance ASC
    `;

    const [rows] = await pool.execute(query, [daysAhead]);
    return rows;
},

    async update(id_marche, updateData) {
        const {
            numero, objet, type_marche_id, statut_id, fournisseur_id,
            appel_offre_id, montant, date_notification, date_debut, date_fin,
            delai_execution_jours, date_reception_provisoire, date_reception_definitive,
            date_prochaine_echeance, observation
        } = updateData;

        const query = `
            UPDATE marches SET 
                numero = ?, objet = ?, type_marche_id = ?, statut_id = ?, fournisseur_id = ?, 
                appel_offre_id = ?, montant = ?, date_notification = ?, date_debut = ?, date_fin = ?, 
                delai_execution_jours = ?, date_reception_provisoire = ?, date_reception_definitive = ?, 
                date_prochaine_echeance = ?, observation = ?, date_modification = NOW()
            WHERE id_marche = ?
        `;

        const [result] = await pool.execute(query, [
            numero, objet, type_marche_id, statut_id, fournisseur_id,
            appel_offre_id || null, montant, date_notification || null, date_debut || null, date_fin || null,
            delai_execution_jours || null, date_reception_provisoire || null, date_reception_definitive || null,
            date_prochaine_echeance || null, observation || null, id_marche
        ]);
        return result.affectedRows > 0;
    },

    // Suppression physique d'un marché. Le controller doit avoir supprimé au
    // préalable la checklist et les documents liés (checklist a une FK RESTRICT
    // sur marche_id qui bloquerait sinon la suppression).
    async remove(id_marche) {
        const [result] = await pool.execute(
            `DELETE FROM marches WHERE id_marche = ?`,
            [id_marche]
        );
        return result.affectedRows > 0;
    },

    async updateStatus(id_marche, statut_id) {
        const query = `
            UPDATE marches 
            SET statut_id = ?, date_modification = NOW() 
            WHERE id_marche = ?
        `;

        const [result] = await pool.execute(query, [statut_id, id_marche]);
        return result.affectedRows > 0;
    }
};

module.exports = Marche;