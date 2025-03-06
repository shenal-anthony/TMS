// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Route to get all admins
router.get('/admins', adminController.getAllAdmins);

module.exports = router;
