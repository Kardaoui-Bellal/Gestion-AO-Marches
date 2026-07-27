const AppelOffre = require("../models/appelOffreModel");
const Marche = require("../models/marcheModel");
const Fournisseur = require("../models/fournisseurModel");
const Historique = require("../models/historiqueModel");

const MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function fmtDate(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function timeAgo(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (isNaN(d)) return "—";
    const diffMs = Date.now() - d.getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "À l'instant";
    if (min < 60) return `Il y a ${min} min`;
    const heures = Math.floor(min / 60);
    if (heures < 24) return `Il y a ${heures} heure${heures > 1 ? "s" : ""}`;
    const jours = Math.floor(heures / 24);
    return `Il y a ${jours} jour${jours > 1 ? "s" : ""}`;
}

// Les référentiels ne remontent que le libellé (pas le code) via les
// requêtes getAll() existantes ; on classe donc les statuts par mots-clés
// plutôt que de modifier les modèles/jointures.
function badgeFromLibelle(libelle) {
    const s = (libelle || "").toLowerCase();
    if (s.includes("expir") || s.includes("suspend") || s.includes("infructueux")) return "danger";
    if (s.includes("cours") || s.includes("préparation") || s.includes("évaluation") || s.includes("ouverture")) return "warning";
    if (s.includes("attribu") || s.includes("achev") || s.includes("lancé")) return "success";
    if (s.includes("annul") || s.includes("résili")) return "neutral";
    return "info";
}

const dashboardController = {
    async index(req, res) {
        try {
            const [appelsOffres, marches, fournisseurs, echeancesProches] = await Promise.all([
                AppelOffre.getAll(),
                Marche.getAll(),
                Fournisseur.getAll(),
                Marche.getEcheancesProches(30),
            ]);

            const today = new Date();

            const marchesActifsList = marches.filter(
                (m) => !/expir|résili|annul|achev/i.test(m.statut_libelle || "")
            );
            const marchesExpires = marches.filter((m) => {
                if (/expir/i.test(m.statut_libelle || "")) return true;
                return m.date_fin && new Date(m.date_fin) < today;
            });
            const marchesEnCours = marches.filter((m) => /cours/i.test(m.statut_libelle || ""));

            const montantEngage = marchesActifsList.reduce((sum, m) => sum + Number(m.montant || 0), 0);

            const stats = {
                appelsOffres: appelsOffres.length,
                marchesActifs: marchesActifsList.length,
                fournisseurs: fournisseurs.length,
                montantEngage,
            };

            const miniStats = {
                enCours: marchesEnCours.length,
                echeancesProches: echeancesProches.length,
                expires: marchesExpires.length,
            };

            // Évolution des AO sur l'année en cours, par mois de création
            const anneeCourante = today.getFullYear();
            const compteursParMois = new Array(12).fill(0);
            appelsOffres.forEach((ao) => {
                if (!ao.date_creation) return;
                const d = new Date(ao.date_creation);
                if (d.getFullYear() === anneeCourante) compteursParMois[d.getMonth()] += 1;
            });
            const evolutionAO = { labels: MOIS, data: compteursParMois };

            // Répartition des marchés par statut
            const parStatut = {};
            marches.forEach((m) => {
                const libelle = m.statut_libelle || "Non défini";
                parStatut[libelle] = (parStatut[libelle] || 0) + 1;
            });
            const repartitionMarches = Object.entries(parStatut).map(([name, value]) => ({ name, value }));

            // Montants engagés par année (sur les 6 dernières années observées)
            const parAnnee = {};
            marches.forEach((m) => {
                const dateRef = m.date_debut || m.date_fin;
                if (!dateRef) return;
                const annee = new Date(dateRef).getFullYear();
                if (isNaN(annee)) return;
                parAnnee[annee] = (parAnnee[annee] || 0) + Number(m.montant || 0);
            });
            const anneesTriees = Object.keys(parAnnee).map(Number).sort((a, b) => a - b).slice(-6);
            const budgetAnnuel = {
                labels: anneesTriees.map(String),
                data: anneesTriees.map((a) => Math.round((parAnnee[a] / 1000000) * 100) / 100), // en MDH
            };

            // Répartition des AO par catégorie (Travaux / Fournitures / Services)
            const parCategorie = {};
            appelsOffres.forEach((ao) => {
                const libelle = ao.categorie_libelle || "Non défini";
                parCategorie[libelle] = (parCategorie[libelle] || 0) + 1;
            });
            const repartitionDomaine = Object.entries(parCategorie).map(([name, value]) => ({ name, value }));

            // Derniers appels d'offres / marchés (déjà triés par date_creation DESC par les modèles)
            const derniersAO = appelsOffres.slice(0, 4).map((ao) => ({
                id: ao.id_ao,
                numero: ao.numero,
                objet: ao.objet,
                date: fmtDate(ao.date_creation),
                statut: ao.etat_libelle,
                badge: badgeFromLibelle(ao.etat_libelle),
            }));

            const derniersMarches = marches.slice(0, 4).map((m) => ({
                id: m.id_marche,
                numero: m.numero,
                fournisseur: m.fournisseur_nom,
                montant: m.montant,
                date: fmtDate(m.date_debut),
                statut: m.statut_libelle,
                badge: badgeFromLibelle(m.statut_libelle),
            }));

            // Alertes : marchés expirés + échéances proches (les plus urgents d'abord)
            const alertes = [
                ...marchesExpires.slice(0, 2).map((m) => ({
                    type: "danger",
                    titre: "Marché expiré",
                    detail: m.numero,
                })),
                ...echeancesProches.slice(0, 3).map((m) => ({
                    type: "warning",
                    titre: "Échéance proche",
                    detail: `${m.numero} — ${fmtDate(m.date_prochaine_echeance)}`,
                })),
            ];
            if (alertes.length === 0) {
                alertes.push({ type: "success", titre: "Aucune alerte", detail: "Tout est à jour" });
            }

            // Activité récente : dernières actions de l'historique (si disponible)
            let activites = [];
            try {
                const historique = await Historique.getAll();
                activites = historique.slice(0, 5).map((h) => ({
                    type: h.action === "ARCHIVE" || h.action === "UPDATE" ? "info" : "success",
                    titre: `${h.action} — ${h.entite_type}`,
                    detail: h.details || `Action effectuée par ${h.utilisateur_nom}`,
                    quand: timeAgo(h.date_action),
                }));
            } catch (e) {
                // l'historique reste secondaire pour le dashboard : on n'échoue pas la page pour ça
                activites = [];
            }

            res.render("dashboard/index", {
                title: "Tableau de bord",
                stats,
                miniStats,
                evolutionAO,
                repartitionMarches,
                budgetAnnuel,
                repartitionDomaine,
                derniersAO,
                derniersMarches,
                alertes,
                activites,
            });
        } catch (err) {
            console.error(err);
            // En cas d'erreur (ex: DB indisponible), la vue retombe sur ses
            // valeurs de démonstration grâce aux valeurs par défaut du template.
            res.render("dashboard/index", { title: "Tableau de bord" });
        }
    },
};

module.exports = dashboardController;
