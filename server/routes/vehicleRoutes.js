const express = require("express");
const { getVehiclesForUser, registerVehicle } = require("../controllers/vehicleController");
const verifyJWT = require("../middlewares/verifyJWT");
const router = express.Router();


router.post("/register", registerVehicle);
router.get("/", verifyJWT ,getVehiclesForUser);


module.exports = router;
