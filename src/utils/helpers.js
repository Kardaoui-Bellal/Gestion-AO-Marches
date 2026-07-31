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

// normalizes a value for comparison — dates become YYYY-MM-DD, null/undefined become ""
function normalizeForDiff(val) {
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    if (val === null || val === undefined) return "";
    return String(val);
}

// compares `before` (a DB row) against `after` (req.body) across a given list of
// fields, and returns only what actually changed — for readable historique entries.
// Returns null if nothing changed (so the caller can skip logging a no-op "update").
function buildDiff(before, after, fields) {
    const changedFields = [];
    const avantParts = [];
    const apresParts = [];

    for (const field of fields) {
        const oldVal = normalizeForDiff(before[field]);
        const newVal = normalizeForDiff(after[field]);
        if (oldVal !== newVal) {
            changedFields.push(field);
            avantParts.push(`${field}: ${oldVal || "—"}`);
            apresParts.push(`${field}: ${newVal || "—"}`);
        }
    }

    if (changedFields.length === 0) return null;

    return {
        champ_modifie: changedFields.join(", "),
        ancienne_valeur: avantParts.join(" | "),
        nouvelle_valeur: apresParts.join(" | "),
    };
}

module.exports = {
    formatDate,
    formatMontant,
    truncate,
    checklistBadgeClass,
    statutBadgeClass,
    buildDiff,
};