const express = require("express");
const router = express.Router();
const utilisateurController = require("../controllers/utilisateurController");
const { requireRole } = require("../middlewares/roleMiddleware");

// user management is admin-only across the board
router.get("/", requireRole("ADMIN"), utilisateurController.list);
router.get("/new", requireRole("ADMIN"), utilisateurController.showCreateForm);
router.get("/:id/edit", requireRole("ADMIN"), utilisateurController.showEditForm);
router.get("/:id/password", requireRole("ADMIN"), utilisateurController.showChangePasswordForm);

router.post("/", requireRole("ADMIN"), utilisateurController.create);
router.post("/:id", requireRole("ADMIN"), utilisateurController.update);
router.post("/:id/password", requireRole("ADMIN"), utilisateurController.changePassword);

module.exports = router;