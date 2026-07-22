// formats a JS Date or SQL date string to French dd/mm/yyyy
function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("fr-FR");
}

// formats a number as Moroccan Dirham currency, e.g. 1 234,50 DH
function formatMontant(value) {
    if (value === null || value === undefined) return "—";
    return `${Number(value).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`;
}

// truncates long text with an ellipsis, used in table cells (objet, observation)
function truncate(text, maxLength = 50) {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

// maps a STATUT_CHECKLIST code to a Bootstrap badge class, for consistent view styling
function checklistBadgeClass(code) {
    const map = {
        TODO: "bg-secondary",
        WIP: "bg-info",
        DONE: "bg-success",
        BLOCKED: "bg-danger",
        NA: "bg-light text-dark",
    };
    return map[code] || "bg-secondary";
}

// maps an ETAT_AO or STATUT_MARCHE code to a Bootstrap badge class
function statutBadgeClass(code) {
    const map = {
        BROUILLON: "bg-secondary",
        PUBLIE: "bg-primary",
        OUVERTURE_PLIS: "bg-info",
        EN_EVALUATION: "bg-warning text-dark",
        ATTRIBUE: "bg-success",
        INFRUCTUEUX: "bg-dark",
        ANNULE: "bg-danger",
        NOTIFIE: "bg-primary",
        EN_COURS: "bg-info",
        SUSPENDU: "bg-warning text-dark",
        ACHEVE: "bg-success",
        RESILIE: "bg-danger",
        RENOUVELE: "bg-success",
        EXPIRE: "bg-dark",
    };
    return map[code] || "bg-secondary";
}

module.exports = {
    formatDate,
    formatMontant,
    truncate,
    checklistBadgeClass,
    statutBadgeClass,
};