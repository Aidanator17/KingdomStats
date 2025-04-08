const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { ensureAuthenticated, ensureAdminOrOwner } = require('../middlewares/auth');
const { sendVerificationEmail, sendEmail } = require('../utils/mailer');
const prisma = new PrismaClient();

router.get('/', ensureAuthenticated, ensureAdminOrOwner, (req, res) => {
    res.render('pages/admin-panel', {
        title: 'Admin Panel',
        pageStyles: '/styles/admin-panel.css'
    });
});

// GET /admin/users?search=...
router.get('/users', ensureAuthenticated, ensureAdminOrOwner, async (req, res) => {
    const search = req.query.search?.trim();

    let users = [];

    if (search) {
        const isId = /^\d+$/.test(search);
        users = await prisma.users.findMany({
            where: isId
                ? { user_id: parseInt(search) }
                : { email: { contains: search.toLowerCase() } },
            include: {
                user_role_assignments: {
                    include: { user_roles: true }
                },
                riot_accounts: true,
            },
        });

    }

    res.json({ users }); // You’ll hook this up to EJS or an API later
});

router.post('/users/:id/role', ensureAuthenticated, ensureAdminOrOwner, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!['basic', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        // Get role ID for the new role
        const roleRecord = await prisma.user_roles.findUnique({
            where: { role_name: role }
        });

        if (!roleRecord) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Remove old role(s)
        await prisma.user_role_assignments.deleteMany({
            where: { user_id: userId }
        });

        // Assign new role
        await prisma.user_role_assignments.create({
            data: {
                user_id: userId,
                role_id: roleRecord.role_id,
            }
        });

        res.json({ message: 'Role updated' });
    } catch (err) {
        console.error('Error updating role:', err);
        res.status(500).json({ message: 'Failed to update role' });
    }
}); // this route is for updating user roles
router.post('/users/:id/resend-verification', ensureAuthenticated, ensureAdminOrOwner, async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        const user = await prisma.users.findUnique({
            where: { user_id: userId }
        });

        if (!user) {
            return res.status(404).send('User not found.');
        }

        if (user.verified) {
            return res.status(400).send('User is already verified.');
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        await prisma.users.update({
            where: { user_id: userId },
            data: { verification_token: verificationToken }
        });

        await sendVerificationEmail(user.email, verificationToken);

        res.redirect('/admin'); // or wherever you want the admin redirected
    } catch (err) {
        console.error('Failed to resend verification email:', err);
        res.status(500).send('Error sending verification email.');
    }
}); // this route is for resending verification emails
router.post('/email/send', ensureAuthenticated, ensureAdminOrOwner, async (req, res) => {
    const { to, subject, body } = req.body;
  
    if (!to || !subject || !body) {
      return res.status(400).send('Missing fields.');
    }
  
    try {
      await sendEmail(to, subject, body);
      res.redirect('/admin'); // or show a success page/message
    } catch (err) {
      res.status(500).send('Failed to send email.\n'+String(err));
    }
  }); // this route is for sending emails to users

module.exports = router;