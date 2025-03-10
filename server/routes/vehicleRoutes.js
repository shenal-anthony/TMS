// server/routes/adminRoutes.js
const express = require("express");
const { getAllVehicles, registerVehicle } = require("../controllers/vehicleController");
const router = express.Router();


router.post("/register", registerVehicle);
router.get("/all", getAllVehicles);


module.exports = router;
