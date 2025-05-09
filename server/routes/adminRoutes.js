// server/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllAdmins,
  deleteAdmin,
  getAdminById,
} = require("../controllers/adminController");

// Route to get all admins
router.get("/", getAllAdmins);
router.get("/:id", getAdminById);
router.get("/status");
router.delete("/:id", deleteAdmin);

module.exports = router;
