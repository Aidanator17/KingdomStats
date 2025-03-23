// app.js
const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const viewRoutes = require('./routes/viewRoutes');
app.use('/', viewRoutes);


// Export app
module.exports = app;