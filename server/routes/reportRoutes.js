// server/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const {
  getStatusCardData,
  getChartData,
  getLogData,
  storeReport,
  viewReport,
  downloadReport,
  getStatusCardDataById,
} = require("../controllers/reportController");

// api/reports/
router.get("/cards/:id", getStatusCardDataById);
router.get("/charts/:id", getChartData);
router.get("/logs/:id", getLogData);
router.get("/view/:id", viewReport);

router.post("/download", downloadReport);
router.post("/store", storeReport);

module.exports = router;
