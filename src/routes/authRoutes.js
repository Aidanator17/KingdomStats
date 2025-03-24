const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const { redirectIfAuthenticated, ensureAuthenticated } = require('../middlewares/auth');

const prisma = new PrismaClient();

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password) {
    return res.render('pages/register', { error: 'Email and password are required.' });
  }

  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.render('pages/register', { error: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        username,
      },
    });

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('pages/register', { error: 'Something went wrong during registration.' });
  }
});

// POST /auth/login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const userRecord = await prisma.users.findUnique({
      where: { email: req.body.email },
      select: { user_id: true }
    });

    await prisma.user_login_attempts.create({
      data: {
        user_id: userRecord?.user_id || null,
        success: !!user,
        attempted_at: new Date(),
        ip_address: ip?.toString().slice(0, 45) || null,
      }
    });

    if (err) return next(err);
    if (!user) return res.render('pages/login', { error: 'Invalid email or password.' });

    req.logIn(user, async err => {
      if (err) return next(err);

      await prisma.users.update({
        where: { user_id: user.user_id },
        data: { last_login: new Date() }
      });

      res.redirect('/');
    });
  })(req, res, next);
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).send('Logout failed.');
    res.redirect('/');
  });
});

module.exports = router;
