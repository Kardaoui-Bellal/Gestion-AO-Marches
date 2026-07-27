const express = require("express");
const router = express.Router();
const parametresController = require("../controllers/parametresController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

router.get("/", isAuthenticated, parametresController.show);

module.exports = router;