const multer = require("multer");
const path = require("path");
const fs = require("fs");

// map type_entite to its upload subfolder, matching your projectTree.txt structure
const UPLOAD_ROOTS = {
    AO: path.join(__dirname, "../uploads/ao"),
    MARCHE: path.join(__dirname, "../uploads/marches"),
};

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const type_entite = req.body.type_entite;

        if (!UPLOAD_ROOTS[type_entite]) {
            return cb(new Error("type_entite invalide (doit être 'AO' ou 'MARCHE')."));
        }

        const dest = UPLOAD_ROOTS[type_entite];

        // ensure the folder exists (uploads/ao and uploads/marches should already exist per your tree,
        // but this guards against a fresh clone missing the empty dirs since git doesn't track empty folders)
        fs.mkdirSync(dest, { recursive: true });

        cb(null, dest);
    },
    filename(req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

function fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error("Type de fichier non autorisé. Formats acceptés : PDF, Word, Excel, JPG, PNG."));
    }
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = upload;