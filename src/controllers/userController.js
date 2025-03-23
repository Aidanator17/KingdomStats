// src/controllers/userController.js
exports.getAllUsers = (req, res) => {
    res.send('Get all users');
};

exports.getUserById = (req, res) => {
    res.send(`Get user with ID ${req.params.id}`);
};

exports.createUser = (req, res) => {
    res.send('Create new user');
};

exports.updateUser = (req, res) => {
    res.send(`Update user with ID ${req.params.id}`);
};

exports.deleteUser = (req, res) => {
    res.send(`Delete user with ID ${req.params.id}`);
};
