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
const MulterMiddleware = require("../middlewares/uploadMiddleware");

const destinationMiddleware = MulterMiddleware([
  { fieldName: "destination", folder: "destinations", maxCount: 1 },
]);

const eventMiddleware = MulterMiddleware([
  { fieldName: "accommodation", folder: "accommodations", maxCount: 1 },
]);

// destinations routes
router.get("/destinations", getAllDestinations);
router.get("/destination/:id", getDestination);
router.post("/destinations", destinationMiddleware, addDestination);
router.patch("/destinations/:id", destinationMiddleware, updateDestination);
router.delete("/destinations/:id", deleteDestination);

// events routes
router.get("/events", getAllEvents);
router.post("/events", MulterMiddleware(), addEvent);
router.delete("/events/:id", deleteEvent);

// packages routes
router.get("/packages", getAllPackages);
router.get("/package/:id", getPackage);
router.post("/packages", addPackage);
router.patch("/packages/:id", updatePackage);
router.delete("/packages/:id", deletePackage);

// accommodations routes
router.get("/accommodations", getAllAccommodations);
router.get("/accommodation/:id", getAccommodation);
router.post("/accommodations", eventMiddleware, addAccommodation);
router.patch("/accommodations/:id", eventMiddleware, updateAccommodation);
router.delete("/accommodations/:id", deleteAccommodation);

// reviews routes

module.exports = router;
