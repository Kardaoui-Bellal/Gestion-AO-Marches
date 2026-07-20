const express = require("express");
const router = express.Router();
const checklistController = require("../controllers/checklistController");
const { requireRole } = require("../middlewares/roleMiddleware");

// optional standalone full-page view, e.g. /checklist/AO/12 or /checklist/MARCHE/7
router.get("/:type_entite/:id", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), checklistController.detail);

// update a single étape — used from the AO/Marché detail page inline forms
router.post("/:id", requireRole("ADMIN", "GESTIONNAIRE"), checklistController.update);

module.exports = router;