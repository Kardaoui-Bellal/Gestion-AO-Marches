
const express = require("express");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/authRoutes");

const { isAuthenticated } = require("./middlewares/authMiddleware");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,          
            maxAge: 1000 * 60 * 60 * 8 
        }
    })
);

app.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    }

    res.redirect("/login");
});

app.use("/", authRoutes);

app.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("dashboard/index", {
        user: req.session.user,
        title: "Tableau de bord"
    });
});


app.use((req, res) => {
    res.status(404).render("404", {
        title: "Page non trouvée"
    });
});

module.exports = app;