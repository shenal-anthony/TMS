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
  getAllAccommodations,
  addAccommodation,
  deleteAccommodation,
  updateAccommodation,
  getAllEvents,
  addEvent,
  deleteEvent,
} = require("../controllers/touristController");


// destinations routes
router.get("/destinations", getAllDestinations);
router.post("/destinations", addDestination);
router.put("/destinations/:id", updateDestination);
router.delete("/destinations/:id", deleteDestination);

// events routes
router.get("/events", getAllEvents)
router.post("/events", addEvent);
router.put("/events/:id", );
router.delete("/events/:id", deleteEvent);

// packages routes
router.get("/packages", getAllPackages);
router.post("/packages", addPackage);
router.put("/packages/:id", updatePackage);
router.delete("/packages/:id", deletePackage);

// accommodations routes
router.get("/accommodations", getAllAccommodations);
router.post("/accommodations", addAccommodation);
router.put("/accommodations/:id", updateAccommodation);
router.delete("/accommodations/:id", deleteAccommodation);

// reviews routes

module.exports = router;
