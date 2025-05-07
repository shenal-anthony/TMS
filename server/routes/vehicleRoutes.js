const express = require("express");
const router = express.Router();
const {
  getVehiclesForUser,
  registerVehicle,
  getAllVehicles,
  changeVehicleStatus,
} = require("../controllers/vehicleController");
const validateVehicleRegistration = require("../middlewares/validateVehicleRegis");

router.post("/register", validateVehicleRegistration, registerVehicle);
router.get("/:id", getVehiclesForUser);
router.get("/manage/:id", getAllVehicles);
router.patch("/status/:id", changeVehicleStatus);

module.exports = router;
