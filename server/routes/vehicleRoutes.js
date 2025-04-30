const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const {
  getVehiclesForUser,
  registerVehicle,
  getAllVehicles,
  changeVehicleStatus,
} = require("../controllers/vehicleController");
const validateVehicleRegistration = require("../middlewares/validateVehicleRegis");

router.post("/register", validateVehicleRegistration, registerVehicle);
router.get("/", verifyJWT, getVehiclesForUser);
router.get("/manage", getAllVehicles);
router.patch("/status/:id", changeVehicleStatus);

module.exports = router;
