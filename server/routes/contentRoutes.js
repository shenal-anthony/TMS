const express = require("express");
const router = express.Router();
const {
  getAllDestinations,
  getDestination,
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
  getPackage,
  getAccommodation,
} = require("../controllers/contentController");
const upload = require("../utils/multerConfig"); // Corrected multer import

// destinations routes
router.get("/destinations", getAllDestinations);
router.get("/destination/:id", getDestination);
router.post("/destinations", upload.single("file"), addDestination);
router.put("/destinations/:id", upload.single("file"), updateDestination);
router.delete("/destinations/:id", deleteDestination);

// events routes
router.get("/events", getAllEvents);
router.post("/events", addEvent);
// router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

// packages routes
router.get("/packages", getAllPackages);
router.get("/package/:id", getPackage);
router.post("/packages", addPackage);
router.put("/packages/:id", updatePackage);
router.delete("/packages/:id", deletePackage);

// accommodations routes
router.get("/accommodations", getAllAccommodations);
router.get("/accommodation/:id", getAccommodation);
router.post("/accommodations", addAccommodation);
router.put("/accommodations/:id", updateAccommodation);
router.delete("/accommodations/:id", deleteAccommodation);

// reviews routes

module.exports = router;
