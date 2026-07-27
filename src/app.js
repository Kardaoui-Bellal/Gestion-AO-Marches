const express = require("express");
const path = require("path");

const sessionMiddleware = require("../config/session");
const authRoutes = require("./routes/authRoutes");
const { isAuthenticated } = require("./middlewares/authMiddleware");
const multerErrorHandler = require("./middlewares/errorHandler");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(sessionMiddleware);

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

app.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    }
    res.redirect("/auth/login");
});

app.use("/auth", authRoutes);

app.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("dashboard/index", {
        user: req.session.user,
        title: "Tableau de bord",
    });
});

app.use("/referentiels", require("./routes/referentielRoutes"));
app.use("/fournisseurs", require("./routes/fournisseurRoutes"));
app.use("/appels-offres", require("./routes/appelOffreRoutes"));
app.use("/offres", require("./routes/offreRoutes"));
app.use("/marches", require("./routes/marcheRoutes"));
app.use("/checklist", require("./routes/checklistRoutes"));
app.use("/documents", require("./routes/documentRoutes"));
app.use("/historique", require("./routes/historiqueRoutes"));
app.use("/utilisateurs", require("./routes/utilisateurRoutes"));
app.use("/export", require("./routes/exportRoutes"));
app.use("/alertes", require("./routes/alerteRoutes"));
app.use("/parametres", require("./routes/parametresRoutes"));


// 404 — no route matched
app.use((req, res) => {
    res.status(404).render("404", {
        title: "Page non trouvée",
    });
});

// error handler — MUST be last, MUST have 4 params
app.use(multerErrorHandler);

module.exports = app;