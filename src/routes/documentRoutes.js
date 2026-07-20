const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const upload = require("../../config/multer");
const { requireRole } = require("../middlewares/roleMiddleware");

router.get("/upload", requireRole("ADMIN", "GESTIONNAIRE"), documentController.showUploadForm);
router.post("/upload", requireRole("ADMIN", "GESTIONNAIRE"), upload.single("document"), documentController.upload);

router.get("/:id/download", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), documentController.download);
router.post("/:id/archive", requireRole("ADMIN", "GESTIONNAIRE"), documentController.archive);

module.exports = router;