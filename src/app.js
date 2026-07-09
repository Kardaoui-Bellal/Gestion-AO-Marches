/**
 * src/app.js
 * Configuration de l'application Express.
 * - Création de l'application
 * - Configuration des middlewares
 * - Configuration des sessions
 * - Configuration du moteur de vues EJS
 * - Déclaration des routes
 */

const express = require("express");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
// const fournisseurRoutes = require("./routes/fournisseurRoutes");
// const appelOffreRoutes = require("./routes/appelOffreRoutes");
// const marcheRoutes = require("./routes/marcheRoutes");

const { isAuthenticated } = require("./middlewares/authMiddleware");

const app = express();

/* ======================================================
   Configuration du moteur de vues (EJS)
====================================================== */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

/* ======================================================
   Middlewares
====================================================== */

// Lecture des données JSON
app.use(express.json());

// Lecture des formulaires HTML
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques (CSS, JS, images...)
app.use(express.static(path.join(__dirname, "../public")));

/* ======================================================
   Sessions
====================================================== */

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,          // Passer à true en HTTPS
            maxAge: 1000 * 60 * 60 * 8 // 8 heures
        }
    })
);

/* ======================================================
   Routes
====================================================== */

// Page d'accueil
app.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    }

    res.redirect("/login");
});

// Authentification
app.use("/", authRoutes);

// Tableau de bord (protégé)
app.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("dashboard/index", {
        user: req.session.user,
        title: "Tableau de bord"
    });
});

// Exemple pour plus tard
// app.use("/fournisseurs", fournisseurRoutes);
// app.use("/appels-offres", appelOffreRoutes);
// app.use("/marches", marcheRoutes);

/* ======================================================
   Gestion des erreurs
====================================================== */

// Erreur 404
app.use((req, res) => {
    res.status(404).render("404", {
        title: "Page non trouvée"
    });
});

module.exports = app;