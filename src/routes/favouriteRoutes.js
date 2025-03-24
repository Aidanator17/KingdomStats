const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { redirectIfAuthenticated, ensureAuthenticated } = require('../middlewares/auth');

// POST /favourites - add a new favourite
router.post('/', ensureAuthenticated, async (req, res) => {
  const user_id = req.user.user_id;
  const { target_puuid, note, username, tag, visibility } = req.body;
  const nickname = `${username}#${tag}`;

  if (!target_puuid) {
    return res.status(400).send('Target PUUID is required');
  }

  try {
    const newFavourite = await prisma.user_favourites.create({
      data: {
        user_id,
        target_puuid,
        note,
        nickname,
        visibility: visibility || 'public', // default to public
      },
    });

    res.redirect('/favourites'); // or wherever you want to show them
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(409).send('This user already has that PUUID saved as a favourite.');
    }
    res.status(500).send('Something went wrong while adding the favourite.');
  }
});

module.exports = router;