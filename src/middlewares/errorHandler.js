const multer = require("multer");

function multerErrorHandler(err, req, res, next) {
    if (err) {
        console.error(`[${new Date().toISOString()}] Erreur sur ${req.method} ${req.originalUrl}:`, err);
    }
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).render("errors/500", { message: "Le fichier dépasse la taille maximale autorisée (10 Mo)." });
        }
        return res.status(400).render("errors/500", { message: `Erreur d'upload : ${err.message}` });
    }
    if (err) {
        // fileFilter throws a plain Error, not a MulterError
        return res.status(400).render("errors/500", { message: err.message });
    }
    next();
}

module.exports = multerErrorHandler;