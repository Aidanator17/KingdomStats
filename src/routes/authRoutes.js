const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const { redirectIfAuthenticated, ensureAuthenticated } = require('../middlewares/auth');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/mailer');

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
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        username,
        verification_token: verificationToken
      },
    });
    await sendVerificationEmail(email, verificationToken);

    res.redirect('/verify-email');
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
    if (!user) {
      return res.render('pages/login', {
        title: 'Login',
        pageStyles: '/styles/auth.css',
        error: info?.message || 'Invalid email or password',
      });
    }

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

// GET /auth/verify/:token
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const user = await prisma.users.findFirst({
      where: { verification_token: token }
    });

    if (!user) {
      return res.status(404).render('pages/verify-email', {
        error: 'Invalid or expired verification token.',
        title: 'Verify Your Email',
        pageStyles: '/styles/auth.css'
      });
    }

    await prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        verified: true,
        verification_token: null // clear token
      }
    });

    res.render('pages/verify-email', {
      message: 'Email verified! You can now log in.',
      title: 'Verify Your Email',
      pageStyles: '/styles/auth.css'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('pages/verify-email', {
      error: 'Verification failed.',
      title: 'Verify Your Email',
      pageStyles: '/styles/auth.css'
    });
  }
});

// POST /auth/password
router.post('/password', ensureAuthenticated, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.user_id;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.render('pages/account', {
      passwordError: 'All password fields are required.',
      user: req.user,
      title: req.user.username,
      pageStyles: '/styles/account.css'
    });
  }
  
  if (newPassword !== confirmPassword) {
    return res.render('pages/account', {
      passwordError: 'New passwords do not match.',
      user: req.user,
      title: req.user.username,
      pageStyles: '/styles/account.css'
    });
  }

  try {
    const user = await prisma.users.findUnique({ where: { user_id: userId } });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.render('pages/account', {
        passwordError: 'Current password is incorrect.',
        user: req.user,
        title: req.user.username,
        pageStyles: '/styles/account.css'
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { user_id: userId },
      data: { password_hash: hashed },
    });

    return res.render('pages/account', {
      passwordSuccess: 'Password updated successfully.',
      user: req.user,
      title: req.user.username,
      pageStyles: '/styles/account.css'
    });
  } catch (err) {
    console.error(err);
    return res.render('pages/account', {
      passwordSuccess: 'Password updated successfully.',
      user: req.user,
      title: req.user.username,
      pageStyles: '/styles/account.css'
    });
  }
});


module.exports = router;
