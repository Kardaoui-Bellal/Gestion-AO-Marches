const multer = require("multer");

function multerErrorHandler(err, req, res, next) {
    if (err) {
        console.error(`[${new Date().toISOString()}] Erreur sur ${req.method} ${req.originalUrl}:`, err);
    }

    if (!err) return next();

    const isDocumentUpload = req.method === "POST" && req.originalUrl.startsWith("/documents/upload");

    if (isDocumentUpload) {
        const { type_entite, entite_id } = req.body || {};

        const message = (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE")
            ? "Le fichier dépasse la taille maximale autorisée (10 Mo)."
            : err.message; // fileFilter's message already lists the allowed types

        if (type_entite && entite_id) {
            return res.redirect(
                `/documents/upload?type_entite=${encodeURIComponent(type_entite)}&entite_id=${encodeURIComponent(entite_id)}&error=${encodeURIComponent(message)}`
            );
        }

        return res.status(400).render("errors/500", { message });
    }

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).render("errors/500", { message: "Le fichier dépasse la taille maximale autorisée (10 Mo)." });
        }
        return res.status(400).render("errors/500", { message: `Erreur d'upload : ${err.message}` });
    }

    return res.status(400).render("errors/500", { message: err.message });
}

module.exports = multerErrorHandler;