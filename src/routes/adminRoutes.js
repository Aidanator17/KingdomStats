const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { ensureAuthenticated, ensureAdminOrOwner } = require('../middlewares/auth');
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

module.exports = router;