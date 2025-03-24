// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { redirectIfAuthenticated, ensureAuthenticated } = require('../middlewares/auth');

// Route to get all users
router.get('/', userController.getAllUsers);

// Route to get a single user by ID
router.get('/:id', userController.getUserById);

// Route to create a new user
router.post('/', userController.createUser);

// Route to update a user
router.put('/:id', userController.updateUser);

// Route to delete a user
router.delete('/:id', userController.deleteUser);

module.exports = router;
