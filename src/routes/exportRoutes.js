const express = require("express");
const router = express.Router();
const exportController = require("../controllers/exportController");
const { requireRole } = require("../middlewares/roleMiddleware");

router.get("/appels-offres/pdf", requireRole("ADMIN", "GESTIONNAIRE"), exportController.appelsOffresPdf);
router.get("/appels-offres/excel", requireRole("ADMIN", "GESTIONNAIRE"), exportController.appelsOffresExcel);
router.get("/marches/pdf", requireRole("ADMIN", "GESTIONNAIRE"), exportController.marchesPdf);
router.get("/marches/excel", requireRole("ADMIN", "GESTIONNAIRE"), exportController.marchesExcel);
router.get("/marches/:id/fiche", requireRole("ADMIN", "GESTIONNAIRE", "CONSULTANT"), exportController.marcheFiche);

module.exports = router;