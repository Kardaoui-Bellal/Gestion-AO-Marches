const express = require("express");
const router = express.Router();
const fournisseurController = require("../controllers/fournisseurController");
const { requireRole } = require("../middlewares/roleMiddleware");

// read access: all authenticated roles
router.get("/", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), fournisseurController.list);
router.get("/search", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), fournisseurController.searchByIce);
router.get("/new", requireRole("ADMIN", "GESTIONNAIRE"), fournisseurController.showCreateForm);
router.get("/:id/edit", requireRole("ADMIN", "GESTIONNAIRE"), fournisseurController.showEditForm);
router.get("/:id", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), fournisseurController.detail);

// write access: admin + gestionnaire only, consultant is read-only per your seed data's intent
router.post("/", requireRole("ADMIN", "GESTIONNAIRE"), fournisseurController.create);
router.post("/:id", requireRole("ADMIN", "GESTIONNAIRE"), fournisseurController.update);
router.post("/:id/toggle", requireRole("ADMIN", "GESTIONNAIRE"), fournisseurController.toggleActif);

module.exports = router;