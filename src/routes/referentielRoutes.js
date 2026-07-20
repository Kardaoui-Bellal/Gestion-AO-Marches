const express = require("express");
const router = express.Router();
const referentielController = require("../controllers/referentielController");
const { requireRole } = require("../middlewares/roleMiddleware");

// referentiels are admin-only — gestionnaires/consultants shouldn't edit lookup tables
router.get("/", requireRole("ADMIN"), referentielController.list);
router.get("/new", requireRole("ADMIN"), referentielController.showCreateForm);
router.post("/", requireRole("ADMIN"), referentielController.create);
router.get("/:id/edit", requireRole("ADMIN"), referentielController.showEditForm);
router.post("/:id", requireRole("ADMIN"), referentielController.update);
router.post("/:id/toggle", requireRole("ADMIN"), referentielController.toggleActif);

module.exports = router;