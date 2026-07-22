// Moroccan ICE (Identifiant Commun de l'Entreprise) is 15 digits
function isValidIce(ice) {
    return /^\d{15}$/.test(String(ice || "").trim());
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function isStrongEnoughPassword(password) {
    return typeof password === "string" && password.length >= 8;
}

// generic non-empty check for required text fields
function isNonEmpty(value) {
    return value !== undefined && value !== null && String(value).trim().length > 0;
}

// ensures a value parses to a positive number (montants, quantités)
function isPositiveNumber(value) {
    const n = Number(value);
    return !isNaN(n) && n >= 0;
}

// ensures dateFin is not before dateDebut (used in appelOffre/marche forms)
function isDateRangeValid(dateDebut, dateFin) {
    if (!dateDebut || !dateFin) return true; // optional fields, skip check
    return new Date(dateFin) >= new Date(dateDebut);
}

module.exports = {
    isValidIce,
    isValidEmail,
    isStrongEnoughPassword,
    isNonEmpty,
    isPositiveNumber,
    isDateRangeValid,
};