require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirhame, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.join());

app.use(session({
  secret: process.env.SESSION_SECRET || 'cle_secrete_a_changer',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 , //1h
         secure: false, //desactive pour http
         httpOnly:true
  } 
}));

app.use('/', authRoutes);

app.get('/', (req, res) => res.redirect('/login'));

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page non trouvée' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
