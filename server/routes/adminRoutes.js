// server/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { getAllAdmins, deleteAdmin } = require("../controllers/adminController");

// Route to get all admins
router.get("/admins", getAllAdmins);
router.delete("/admins/:id", deleteAdmin);


module.exports = router;
