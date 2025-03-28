const express = require('express');
const session = require('express-session');
const passport = require('passport');
const initializePassport = require('./config/passport');
require('dotenv').config();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Express body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET, // replace with env var in prod
    resave: false,
    saveUninitialized: false,
}));

// Initialize Passport
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());
// Set up user object globally
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.favourites = req.user?.favourites || [];
  res.locals.role = req.user?.user_role_assignments[0].user_roles?.role_name || null;
  next();
});

  

// Set view engine
app.set('view engine', 'ejs');

// Set views directory (optional but good practice)
app.set('views', path.join(__dirname, 'views'));

// Use express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout'); // this assumes views/layout.ejs

// Static files (CSS)
app.use(express.static(path.join(__dirname, 'public')));
// Serve riot.txt directly from root path
app.use('/riot.txt', express.static(path.join(__dirname, 'public/text/riot.txt')));

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const viewRoutes = require('./routes/viewRoutes');
app.use('/', viewRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const favouriteRoutes = require('./routes/favouriteRoutes');
app.use('/api/favourites', favouriteRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);


// Export app
module.exports = app;