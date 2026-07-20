const express = require("express");
const router = express.Router();
const historiqueController = require("../controllers/historiqueController");
const { requireRole } = require("../middlewares/roleMiddleware");

// audit log is sensitive — admin-only, consultants/gestionnaires shouldn't see everyone's actions
router.get("/", requireRole("ADMIN"), historiqueController.list);
router.get("/entite/:entite_type/:entite_id", requireRole("ADMIN"), historiqueController.getByEntity);

module.exports = router;