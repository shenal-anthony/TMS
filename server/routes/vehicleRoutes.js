const express = require("express");
const {
  getVehiclesForUser,
  registerVehicle,
  getAllVehicles,
} = require("../controllers/vehicleController");
const verifyJWT = require("../middlewares/verifyJWT");
const validateVehicleRegistration = require("../middlewares/validateVehicleRegis");
const router = express.Router();

router.post("/register", validateVehicleRegistration, registerVehicle);
router.get("/", verifyJWT, getVehiclesForUser);
router.get("/manage", getAllVehicles);

module.exports = router;
