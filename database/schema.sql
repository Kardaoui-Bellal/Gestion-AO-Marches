-- =========================================================
-- ORMVA/SM - Bureau Informatique
-- Application de gestion des Appels d'Offres et Marchés Informatiques
-- Schéma global (Étape 0.2 du plan de développement)
-- Toutes les tables sont créées dès le départ pour éviter
-- les ruptures de clés étrangères lors des phases suivantes.
-- Règle : ON DELETE RESTRICT partout (jamais CASCADE),
-- champs actif/archive en booléen (suppression physique interdite).
-- =========================================================

CREATE DATABASE IF NOT EXISTS ormvasm_ao_marches
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ormvasm_ao_marches;

-- ---------------------------------------------------------
-- Table : utilisateurs
-- (nécessaire pour la page Connexion - Étape 0.3)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS utilisateurs (
  id_utilisateur   INT AUTO_INCREMENT PRIMARY KEY,
  nom              VARCHAR(150)        NOT NULL,
  login            VARCHAR(50)         NOT NULL UNIQUE,
  mot_de_passe     VARCHAR(255)        NOT NULL, -- haché avec bcrypt
  profil           ENUM('Administrateur','Consultation') NOT NULL DEFAULT 'Consultation',
  actif            BOOLEAN             NOT NULL DEFAULT TRUE,
  date_creation    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_maj         DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table : referentiels (Phase 1 - listes paramétrables)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS referentiels (
  id_ref           INT AUTO_INCREMENT PRIMARY KEY,
  type_ref         VARCHAR(50)         NOT NULL, -- ex: 'etat_ao', 'statut_marche', 'type_document', 'domaine_fournisseur', 'categorie'
  libelle          VARCHAR(150)        NOT NULL,
  actif            BOOLEAN             NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_type_libelle (type_ref, libelle)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table : fournisseurs (Phase 2)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS fournisseurs (
  id_fournisseur   INT AUTO_INCREMENT PRIMARY KEY,
  raison_sociale   VARCHAR(200)        NOT NULL,
  ice              CHAR(15)            NOT NULL UNIQUE, -- ICE : 15 chiffres
  adresse          VARCHAR(255),
  telephone        VARCHAR(30),
  email            VARCHAR(150),
  contact          VARCHAR(150),
  domaine_activite VARCHAR(150),
  actif            BOOLEAN             NOT NULL DEFAULT TRUE,
  date_creation    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_maj         DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table : appels_offres (Phase 3)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS appels_offres (
  id_ao               INT AUTO_INCREMENT PRIMARY KEY,
  numero_ao            VARCHAR(50)     NOT NULL UNIQUE,
  objet                VARCHAR(255)    NOT NULL,
  categorie            VARCHAR(100),
  estimation           DECIMAL(15,2),
  date_lancement       DATE,
  date_limite_depot    DATE,
  date_ouverture_plis  DATE,
  date_attribution     DATE,
  etat                 ENUM('En préparation','Lancé','En cours d''évaluation','Attribué','Annulé','Infructueux')
                        NOT NULL DEFAULT 'En préparation',
  id_attributaire      INT NULL,
  observation          TEXT,
  archive              BOOLEAN         NOT NULL DEFAULT FALSE,
  date_creation        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_maj             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ao_attributaire FOREIGN KEY (id_attributaire)
    REFERENCES fournisseurs(id_fournisseur) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table : marches (Phase 4)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS marches (
  id_marche                INT AUTO_INCREMENT PRIMARY KEY,
  numero_marche            VARCHAR(50)  NOT NULL UNIQUE,
  objet                    VARCHAR(255) NOT NULL,
  type_marche              ENUM('ferme','cadre','reconductible') NOT NULL,
  id_ao                    INT NULL,
  id_fournisseur           INT NOT NULL,
  montant_ttc              DECIMAL(15,2) NOT NULL,
  date_notification        DATE,
  date_debut               DATE NOT NULL,
  date_fin                 DATE NOT NULL,
  delai_execution          INT, -- en jours
  statut                   ENUM('En cours','Achevé','Résilié','Renouvelé','Expiré') NOT NULL DEFAULT 'En cours',
  date_reception_provisoire DATE,
  date_reception_definitive DATE,
  prochaine_reconduction    DATE NULL, -- obligatoire si type_marche = reconductible (contrôle applicatif)
  observation               TEXT,
  archive                   BOOLEAN NOT NULL DEFAULT FALSE,
  date_creation             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_maj                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_marche_ao FOREIGN KEY (id_ao)
    REFERENCES appels_offres(id_ao) ON DELETE RESTRICT,
  CONSTRAINT fk_marche_fournisseur FOREIGN KEY (id_fournisseur)
    REFERENCES fournisseurs(id_fournisseur) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table : documents (Phase 8)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id_document      INT AUTO_INCREMENT PRIMARY KEY,
  type_dossier     ENUM('ao','marche') NOT NULL,
  id_dossier       INT NOT NULL, -- référence id_ao ou id_marche selon type_dossier
  type_document    VARCHAR(100) NOT NULL,
  nom_document     VARCHAR(255) NOT NULL,
  chemin_fichier   VARCHAR(500) NOT NULL,
  date_ajout       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observation      TEXT,
  archive          BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table : checklist_dossier (Phase 10)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS checklist_dossier (
  id_etape         INT AUTO_INCREMENT PRIMARY KEY,
  type_dossier     ENUM('ao','marche') NOT NULL,
  id_dossier       INT NOT NULL,
  libelle_etape    VARCHAR(150) NOT NULL,
  statut_etape     ENUM('à faire','en cours','terminé') NOT NULL DEFAULT 'à faire',
  date_realisation DATE NULL,
  observation      TEXT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table : historique (Phase 11)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS historique (
  id_historique     INT AUTO_INCREMENT PRIMARY KEY,
  table_concernee   VARCHAR(50) NOT NULL,
  id_enregistrement INT NOT NULL,
  action            VARCHAR(50) NOT NULL, -- création / modification / archivage
  date_action       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  utilisateur       VARCHAR(150),
  detail            TEXT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Index utiles pour la recherche multicritère (Phase 5)
-- ---------------------------------------------------------
CREATE INDEX idx_ao_etat ON appels_offres(etat);
CREATE INDEX idx_marche_statut ON marches(statut);
CREATE INDEX idx_marche_date_fin ON marches(date_fin);
CREATE INDEX idx_documents_dossier ON documents(type_dossier, id_dossier);
CREATE INDEX idx_checklist_dossier ON checklist_dossier(type_dossier, id_dossier);
