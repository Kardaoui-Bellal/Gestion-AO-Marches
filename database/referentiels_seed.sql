SET NAMES utf8mb4;

INSERT INTO referentiels
(type_referentiel, code, libelle, ordre_affichage, actif)
VALUES

-- =====================================================
-- ROLE
-- =====================================================
('ROLE','ADMIN','Administrateur',1,TRUE),
('ROLE','GESTIONNAIRE','Gestionnaire',2,TRUE),
('ROLE','CONSULTANT','Consultation seule',3,TRUE),

-- =====================================================
-- DOMAINE_ACTIVITE
-- =====================================================
('DOMAINE_ACTIVITE','TRAVAUX','Bâtiment et Travaux Publics',1,TRUE),
('DOMAINE_ACTIVITE','FOURNITURES','Mobilier et Fournitures',2,TRUE),
('DOMAINE_ACTIVITE','IT','Informatique et Télécoms',3,TRUE),
('DOMAINE_ACTIVITE','SERVICES','Services et Prestations intellectuelles',4,TRUE),

-- =====================================================
-- CATEGORIE_AO
-- =====================================================
('CATEGORIE_AO','TRAVAUX','Marché de Travaux',1,TRUE),
('CATEGORIE_AO','FOURNITURES','Marché de Fournitures',2,TRUE),
('CATEGORIE_AO','SERVICES','Marché de Services',3,TRUE),

-- =====================================================
-- ETAT_AO
-- =====================================================
('ETAT_AO','BROUILLON','En préparation',1,TRUE),
('ETAT_AO','PUBLIE','Lancé',2,TRUE),
('ETAT_AO','OUVERTURE_PLIS','Plis ouverts',3,TRUE),
('ETAT_AO','EN_EVALUATION','En cours d''évaluation',4,TRUE),
('ETAT_AO','ATTRIBUE','Attribué',5,TRUE),
('ETAT_AO','INFRUCTUEUX','Infructueux',6,TRUE),
('ETAT_AO','ANNULE','Annulé',7,TRUE),

-- =====================================================
-- STATUT_OFFRE
-- =====================================================
('STATUT_OFFRE','RECUE','Reçue',1,TRUE),
('STATUT_OFFRE','ADMISSIBLE','Admissible',2,TRUE),
('STATUT_OFFRE','REJETEE','Rejetée',3,TRUE),
('STATUT_OFFRE','RETENUE','Retenue',4,TRUE),

-- =====================================================
-- TYPE_MARCHE
-- =====================================================
('TYPE_MARCHE','CADRE','Cadre',1,TRUE),
('TYPE_MARCHE','FERME','Ferme',2,TRUE),
('TYPE_MARCHE','RECONDUCTIBLE','Reconductible',3,TRUE),

-- =====================================================
-- STATUT_MARCHE
-- =====================================================
('STATUT_MARCHE','NOTIFIE','Notifié',1,TRUE),
('STATUT_MARCHE','EN_COURS','En cours d''exécution',2,TRUE),
('STATUT_MARCHE','SUSPENDU','Suspendu',3,TRUE),
('STATUT_MARCHE','ACHEVE','Achevé',4,TRUE),
('STATUT_MARCHE','RESILIE','Résilié',5,TRUE),
('STATUT_MARCHE','RENOUVELE','Renouvelé',6,TRUE),
('STATUT_MARCHE','EXPIRE','Expiré',7,TRUE),

-- =====================================================
-- ETAPE_CHECKLIST
-- =====================================================
('ETAPE_CHECKLIST_AO','EXPR_BESOIN','Expression du besoin',1,TRUE),
('ETAPE_CHECKLIST_AO','VALID_TECH','Validation technique du besoin',2,TRUE),
('ETAPE_CHECKLIST_AO','VALID_CPS','Validation du CPS',3,TRUE),
('ETAPE_CHECKLIST_AO','VALID_RC','Validation du RC',4,TRUE),
('ETAPE_CHECKLIST_AO','VALID_BP','Validation du Bordereau des prix',5,TRUE),
('ETAPE_CHECKLIST_AO','PUB_AVIS','Publication de l''avis',6,TRUE),
('ETAPE_CHECKLIST_AO','PV_OUVERTURE','Établissement du PV d''ouverture',7,TRUE),
('ETAPE_CHECKLIST_AO','REC_OFFRES','Réception des offres',8,TRUE),
('ETAPE_CHECKLIST_AO','ANALYSE_TECH','Analyse technique',9,TRUE),
('ETAPE_CHECKLIST_AO','T_RECAP_AT','Tableau récapitulatif d''analyse technique',10,TRUE),
('ETAPE_CHECKLIST_AO','ATTRIBUTION','Décision d''attribution',11,TRUE),
('ETAPE_CHECKLIST_MARCHE','NOTIF','Notification du marché',12,TRUE),
('ETAPE_CHECKLIST_MARCHE','OS_DEBUT','Ordre de service de démarrage',13,TRUE),
('ETAPE_CHECKLIST_MARCHE','RECEPT_PROV','Réception provisoire',14,TRUE),
('ETAPE_CHECKLIST_MARCHE','RECEPT_DEF','Réception définitive',15,TRUE),

-- =====================================================
-- STATUT_CHECKLIST
-- =====================================================
('STATUT_CHECKLIST','TODO','À faire',1,TRUE),
('STATUT_CHECKLIST','WIP','En cours',2,TRUE),
('STATUT_CHECKLIST','DONE','Validé',3,TRUE),
('STATUT_CHECKLIST','BLOCKED','Bloqué',4,TRUE),
('STATUT_CHECKLIST','NA','Non applicable',5,TRUE),

-- =====================================================
-- TYPE_DOCUMENT
-- =====================================================
('TYPE_DOCUMENT_AO','CPS','Cahier des Prescriptions Spéciales',1,TRUE),
('TYPE_DOCUMENT_AO','RC','Règlement de Consultation',2,TRUE),
('TYPE_DOCUMENT_AO','BORDEREAU_PRIX','Bordereau des prix',3,TRUE),
('TYPE_DOCUMENT_AO','PV','Procès-Verbal',4,TRUE),
('TYPE_DOCUMENT_MARCHE','CONTRAT','Contrat signé',5,TRUE),
('TYPE_DOCUMENT_MARCHE','OS','Ordre de service',6,TRUE),
('TYPE_DOCUMENT_MARCHE','FACTURE','Facture',7,TRUE),
('TYPE_DOCUMENT_MARCHE','BON_LIVRAISON','Bon de livraison',8,TRUE),
('TYPE_DOCUMENT_AO','ATTESTATION','Attestations administratives',9,TRUE),
('TYPE_DOCUMENT_MARCHE','CORRESPONDANCE','Correspondances diverses',10,TRUE),
('TYPE_DOCUMENT_AO','CORRESPONDANCE','Correspondances diverses',10,TRUE),
('TYPE_DOCUMENT_AO','AVIS_AO','Avis d''appel d''offres',11,TRUE),
('TYPE_DOCUMENT_MARCHE','ATT_GARANTIE','Attestation de garantie',12,TRUE),
('TYPE_DOCUMENT_MARCHE','DECOMPTE','Décompte',13,TRUE),
('TYPE_DOCUMENT_MARCHE','PV_RP','PV de réception provisoire',14,TRUE),
('TYPE_DOCUMENT_MARCHE','PV_RD','PV de réception définitive',15,TRUE),
('TYPE_DOCUMENT_AO','AUTRE','Autre document',16,TRUE),
('TYPE_DOCUMENT_MARCHE','AUTRE','Autre document',16,TRUE);