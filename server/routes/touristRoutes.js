const express = require("express");
const router = express.Router();
const {
  getAllDestinations,
  addDestination,
  updateDestination,
  deleteDestination,
  getAllPackages,
  addPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/touristController");

// destinations routes
router.get("/destinations", getAllDestinations);
router.post("/destinations", addDestination);
router.put("/destinations/:id", updateDestination);
router.delete("/destinations/:id", deleteDestination);

// events routes

// packages routes
router.get("/packages", getAllPackages);
router.post("/packages", addPackage);
router.put("/packages/:id", updatePackage);
router.delete("/packages/:id", deletePackage);

// reviews routes

module.exports = router;
