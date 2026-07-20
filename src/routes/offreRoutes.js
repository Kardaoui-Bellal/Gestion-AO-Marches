const express = require("express");
const router = express.Router();
const offreController = require("../controllers/offreController");
const { requireRole } = require("../middlewares/roleMiddleware");

// standalone offre routes (mounted at /offres)
router.get("/:id/edit", requireRole("ADMIN", "GESTIONNAIRE"), offreController.showEditForm);
router.post("/:id", requireRole("ADMIN", "GESTIONNAIRE"), offreController.update);
router.post("/:id/statut", requireRole("ADMIN", "GESTIONNAIRE"), offreController.updateStatus);

module.exports = router;