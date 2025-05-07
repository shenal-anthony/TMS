// server/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { getStatusCardData } = require("../controllers/reportController");

// api/reports/
router.get("/cards/:id", getStatusCardData);




module.exports = router;
