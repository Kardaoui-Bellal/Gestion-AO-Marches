const express = require("express");
const router = express.Router();
const alerteController = require("../controllers/alerteController");
const { requireRole } = require("../middlewares/roleMiddleware");

router.get("/", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), alerteController.list);

module.exports = router;
