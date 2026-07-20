
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE referentiels (
 id_ref INT AUTO_INCREMENT PRIMARY KEY,
 type_referentiel VARCHAR(50) NOT NULL,
 code VARCHAR(50) NOT NULL,
 libelle VARCHAR(150) NOT NULL,
 ordre_affichage INT DEFAULT 0,
 actif BOOLEAN NOT NULL DEFAULT TRUE,
 UNIQUE(type_referentiel,code)
) ENGINE=InnoDB;

CREATE TABLE utilisateurs (
 id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
 nom VARCHAR(150) NOT NULL,
 email VARCHAR(150) NOT NULL UNIQUE,
 mot_de_passe_hash VARCHAR(255) NOT NULL,
 profil_id INT NOT NULL,
 actif BOOLEAN NOT NULL DEFAULT TRUE,
 date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
 date_modification DATETIME NULL,
 INDEX(profil_id),
 CONSTRAINT fk_utilisateur_profil FOREIGN KEY(profil_id)
 REFERENCES referentiels(id_ref)
 ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE fournisseurs (
 id_fournisseur INT AUTO_INCREMENT PRIMARY KEY,
 raison_sociale VARCHAR(200) NOT NULL,
 ice VARCHAR(15) UNIQUE NOT NULL,
 adresse VARCHAR(255),
 telephone VARCHAR(30),
 email VARCHAR(150),
 contact VARCHAR(150),
 domaine_activite_id INT NOT NULL,
 actif BOOLEAN DEFAULT TRUE,
 date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
 date_modification DATETIME NULL,
 INDEX(domaine_activite_id),
 CONSTRAINT fk_fournisseur_domaine FOREIGN KEY(domaine_activite_id)
 REFERENCES referentiels(id_ref)
 ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE appels_offres (
 id_ao INT AUTO_INCREMENT PRIMARY KEY,
 numero_ao VARCHAR(50) NOT NULL UNIQUE,
 objet VARCHAR(255) NOT NULL,
 categorie_id INT NOT NULL,
 etat_id INT NOT NULL,
 montant_estimatif DECIMAL(15,2) NOT NULL,
 CHECK (montant_estimatif >= 0),
 date_lancement DATE,
 date_limite_depot DATE,
 date_ouverture_plis DATE,
 date_attribution DATE,
 fournisseur_attributaire_id INT NULL,
 observation TEXT,
 date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
 date_modification DATETIME NULL,
 INDEX(categorie_id),INDEX(etat_id),INDEX(fournisseur_attributaire_id),
 FOREIGN KEY(categorie_id) REFERENCES referentiels(id_ref) ON UPDATE CASCADE ON DELETE RESTRICT,
 FOREIGN KEY(etat_id) REFERENCES referentiels(id_ref) ON UPDATE CASCADE ON DELETE RESTRICT,
 FOREIGN KEY(fournisseur_attributaire_id) REFERENCES fournisseurs(id_fournisseur) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE offres(
 id_offre INT AUTO_INCREMENT PRIMARY KEY,
 appel_offre_id INT NOT NULL,
 fournisseur_id INT NOT NULL,
 montant_propose DECIMAL(15,2) NOT NULL,
 CHECK (montant_propose >= 0),
 date_soumission DATE,
 statut_id INT NOT NULL,
 date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
 date_modification DATETIME NULL,
 UNIQUE(appel_offre_id,fournisseur_id),
 INDEX(appel_offre_id),INDEX(fournisseur_id),INDEX(statut_id),
 FOREIGN KEY(appel_offre_id) REFERENCES appels_offres(id_ao) ON UPDATE CASCADE ON DELETE RESTRICT,
 FOREIGN KEY(fournisseur_id) REFERENCES fournisseurs(id_fournisseur) ON UPDATE CASCADE ON DELETE RESTRICT,
 FOREIGN KEY(statut_id) REFERENCES referentiels(id_ref) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE marches(
 id_marche INT AUTO_INCREMENT PRIMARY KEY,
 numero VARCHAR(50) UNIQUE NOT NULL,
 objet VARCHAR(255) NOT NULL,
 type_marche_id INT NOT NULL,
 statut_id INT NOT NULL,
 fournisseur_id INT NOT NULL,
 appel_offre_id INT NULL,
 montant DECIMAL(15,2) NOT NULL,
 CHECK (montant >= 0),
 date_notification DATE,
 date_debut DATE,
 date_fin DATE,
 delai_execution_jours INT,
 date_reception_provisoire DATE,
 date_reception_definitive DATE,
 date_prochaine_echeance DATE,
 observation TEXT,
 date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
 date_modification DATETIME NULL,
 INDEX(type_marche_id),INDEX(statut_id),INDEX(fournisseur_id),INDEX(appel_offre_id),
 FOREIGN KEY(type_marche_id) REFERENCES referentiels(id_ref) ON UPDATE CASCADE ON DELETE RESTRICT,
 FOREIGN KEY(statut_id) REFERENCES referentiels(id_ref) ON UPDATE CASCADE ON DELETE RESTRICT,
 FOREIGN KEY(fournisseur_id) REFERENCES fournisseurs(id_fournisseur) ON UPDATE CASCADE ON DELETE RESTRICT,
 FOREIGN KEY(appel_offre_id) REFERENCES appels_offres(id_ao) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;


CREATE TABLE checklist (
  id_checklist INT AUTO_INCREMENT PRIMARY KEY,
  type_entite ENUM('AO','MARCHE') NOT NULL,
  appel_offre_id INT DEFAULT NULL,
  marche_id INT DEFAULT NULL,
  etape_id INT NOT NULL,
  statut_id INT NOT NULL,
  date_validation DATE DEFAULT NULL,
  observation TEXT,
  UNIQUE KEY (marche_id, etape_id),
  INDEX (etape_id),
  INDEX (statut_id),
  INDEX idx_checklist_entite (type_entite, appel_offre_id, marche_id),
  CONSTRAINT checklist_ibfk_1 FOREIGN KEY (marche_id) REFERENCES marches(id_marche),
  CONSTRAINT checklist_ibfk_2 FOREIGN KEY (etape_id) REFERENCES referentiels(id_ref),
  CONSTRAINT checklist_ibfk_3 FOREIGN KEY (statut_id) REFERENCES referentiels(id_ref)
) ENGINE=InnoDB;

CREATE TABLE documents (
 id_document INT AUTO_INCREMENT PRIMARY KEY,
 type_entite ENUM('AO','MARCHE') NOT NULL,
 entite_id INT NOT NULL,
 type_document_id INT NOT NULL,
 nom_original VARCHAR(255) NOT NULL,
 nom_stocke VARCHAR(255) NOT NULL,
 chemin_dossier VARCHAR(255) NOT NULL,
 taille BIGINT,
 mime_type VARCHAR(100),
 observation TEXT NULL,
 date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX(type_document_id),
 FOREIGN KEY (type_document_id) REFERENCES referentiels(id_ref) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE historique(
 id_historique INT AUTO_INCREMENT PRIMARY KEY,
 utilisateur_id INT NOT NULL,
 action ENUM('INSERT','UPDATE','ARCHIVE','UPLOAD','LOGIN','LOGOUT','EXPORT') NOT NULL;
 entite_type VARCHAR(50) NOT NULL,
 entite_id INT NOT NULL,
 champ_modifie VARCHAR(100),
 ancienne_valeur TEXT,
 nouvelle_valeur TEXT,
 details TEXT,
 date_action DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX(utilisateur_id),
 FOREIGN KEY(utilisateur_id) REFERENCES utilisateurs(id_utilisateur)
 ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS=1;