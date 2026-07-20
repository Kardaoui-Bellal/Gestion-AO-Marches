const express = require("express");
const router = express.Router();
const appelOffreController = require("../controllers/appelOffreController");
const { requireRole } = require("../middlewares/roleMiddleware");

router.get("/", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), appelOffreController.list);
router.get("/new", requireRole("ADMIN", "GESTIONNAIRE"), appelOffreController.showCreateForm);
router.get("/:id/edit", requireRole("ADMIN", "GESTIONNAIRE"), appelOffreController.showEditForm);
router.get("/:id", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), appelOffreController.detail);

router.post("/", requireRole("ADMIN", "GESTIONNAIRE"), appelOffreController.create);
router.post("/:id", requireRole("ADMIN", "GESTIONNAIRE"), appelOffreController.update);
router.post("/:id/attribuer", requireRole("ADMIN", "GESTIONNAIRE"), appelOffreController.attribuer);
router.post("/:id/statut", requireRole("ADMIN", "GESTIONNAIRE"), appelOffreController.updateStatut);

module.exports = router;