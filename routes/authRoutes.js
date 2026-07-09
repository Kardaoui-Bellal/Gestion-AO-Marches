/**
 * Étape 0.3 - Page Connexion
 * Routes : POST /auth/login, POST /auth/logout, GET /auth/me
 */
const express = require('express');
const router = express.Router();
const { login, logout, me } = require('../controllers/authController');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);

module.exports = router;
