// src/routes/viewRoutes.js
const express = require('express');
const router = express.Router();

// Render the home page
router.get('/', (req, res) => {
  res.render('pages/landing', { title: 'KingdomStats - Home' });
});


// Render a user's public profile page
router.get('/user/:username', (req, res) => {
  const username = req.params.username;

  // You'd probably use Prisma here to fetch user info
  res.render('userProfile', { username }); // assumes views/userProfile.ejs
});

module.exports = router;