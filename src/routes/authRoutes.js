const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(201).json({ message: 'User registered!', user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong during registration.' });
  }
});

// POST /auth/login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
      const prisma = new PrismaClient();
  
      // Get IP address (optional enhancement)
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
      // Log the login attempt BEFORE checking result
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
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  
      req.logIn(user, async err => {
        if (err) return next(err);
  
        // Update last_login timestamp
        await prisma.users.update({
          where: { user_id: user.user_id },
          data: { last_login: new Date() }
        });
  
        res.json({ message: 'Logged in successfully!', user });
      });
    })(req, res, next);
  });
  

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: 'Logout failed.' });
    res.json({ message: 'Logged out successfully.' });
  });
});

module.exports = router;