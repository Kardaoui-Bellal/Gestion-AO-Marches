const express = require("express");
const router = express.Router();
const marcheController = require("../controllers/marcheController");
const { requireRole } = require("../middlewares/roleMiddleware");

router.get("/echeances", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), marcheController.echeances);
router.get("/", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), marcheController.list);
router.get("/new", requireRole("ADMIN", "GESTIONNAIRE"), marcheController.showCreateForm);
router.get("/:id/edit", requireRole("ADMIN", "GESTIONNAIRE"), marcheController.showEditForm);
router.get("/:id/fiche", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), marcheController.ficheView);
router.get("/:id", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), marcheController.detail);

router.post("/", requireRole("ADMIN", "GESTIONNAIRE"), marcheController.create);
router.post("/:id", requireRole("ADMIN", "GESTIONNAIRE"), marcheController.update);
router.post("/:id/statut", requireRole("ADMIN", "GESTIONNAIRE"), marcheController.updateStatus);

module.exports = router;