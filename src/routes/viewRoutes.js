// src/routes/viewRoutes.js
const express = require('express');
const router = express.Router();
const { redirectIfAuthenticated, ensureAuthenticated } = require('../middlewares/auth');
const { sendVerificationEmail } = require('../utils/mailer');

// Render the home page
router.get('/', async (req, res) => {
  if (typeof req.user !== 'undefined') {
    console.log(req.user.user_role_assignments);
  }
  const favourites = (req.user && req.user.user_favourites) ? req.user.user_favourites : [{ nickname: "Aidanator#JAX", target_puuid: "27f3cba4-d42c-563d-9b12-92dc4ac54127" }]; // replace with empty array in live app
  res.render('pages/landing', {
    title: 'KingdomStats - Home',
    pageStyles: false,
    favourites
  });
});


// GET /login
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('pages/login', {
    title: 'Login',
    pageStyles: '/styles/auth.css'
  });
});

// GET /register
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('pages/signup', {
    title: 'Register',
    pageStyles: '/styles/auth.css'
  });
});


router.get('/verify-email', (req, res) => {
  res.render('pages/verify-email', {
    title: 'Verify Your Email',
    pageStyles: '/styles/auth.css' // or wherever your auth card styles live
  });
});

router.get('/account', ensureAuthenticated, (req, res) => {
  res.render('pages/account', {
    title: req.user.username,
    pageStyles: '/styles/account.css',
    user: req.user
  });
});

// Render a user's public profile page
router.get('/user/:username', (req, res) => {
  const username = req.params.username;

  // You'd probably use Prisma here to fetch user info
  res.render('userProfile', { username }); // assumes views/userProfile.ejs
});

module.exports = router;