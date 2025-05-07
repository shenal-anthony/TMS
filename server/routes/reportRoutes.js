// server/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const {
  getStatusCardData,
  getChartData,
} = require("../controllers/reportController");

// api/reports/
router.get("/cards/:id", getStatusCardData);
router.get("/charts/:id", getChartData);

module.exports = router;
