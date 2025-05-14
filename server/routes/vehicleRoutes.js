const express = require("express");
const router = express.Router();
const {
  getVehiclesForUser,
  registerVehicle,
  getAllVehicles,
  changeVehicleStatus,
} = require("../controllers/vehicleController");
const validateVehicleRegistration = require("../middlewares/validateVehicleRegis");
const MulterMiddleware = require("../middlewares/uploadMiddleware");

const vehicleRegistrationMiddleware = MulterMiddleware([
  { fieldName: "vehiclePicture", folder: "vehicle_pics", maxCount: 1 },
  { fieldName: "vehicleLicense", folder: "vehicle_licenses", maxCount: 3 }
]);

router.post("/register", vehicleRegistrationMiddleware, registerVehicle);
router.get("/:id", getVehiclesForUser);
router.get("/manage/:id", getAllVehicles);
router.patch("/status/:id", changeVehicleStatus);

module.exports = router;
