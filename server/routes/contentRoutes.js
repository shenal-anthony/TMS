const express = require("express");
const router = express.Router();
const {
  getAllDestinations,
  getDestination,
  addDestination,
  updateDestination,
  deleteDestination,
  getPackageDetailsWithTours,
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
  getAllTours,
  getTour,
  addTour,
  updateTour,
  deleteTour,
  getPackageDetails,
  getTourDetails,
  getAllPackagesDetails,
  getRelatedPackages,
} = require("../controllers/contentController");
const MulterMiddleware = require("../middlewares/uploadMiddleware");

const destinationMiddleware = MulterMiddleware([
  { fieldName: "destination", folder: "destinations", maxCount: 1 },
]);

const eventMiddleware = MulterMiddleware([
  { fieldName: "accommodation", folder: "accommodations", maxCount: 1 },
]);

const tourMiddleware = MulterMiddleware([
  { fieldName: "tour", folder: "tours", maxCount: 1 },
]);

// destinations routes
router.get("/destinations", getAllDestinations);
router.get("/destination/:id", getDestination);
router.post("/destinations", destinationMiddleware, addDestination);
router.patch("/destinations/:id", destinationMiddleware, updateDestination);
router.delete("/destinations/:id", deleteDestination);

// events routes
// router.get("/events", getAllEvents);
// router.post("/events", MulterMiddleware(), addEvent);
// router.delete("/events/:id", deleteEvent);

// Tours routes
router.get("/tours", getAllTours);
router.get("/tours/:id", getTourDetails);
router.get("/tour/:id", getTour);
router.post("/tours", tourMiddleware, addTour);
router.patch("/tours/:id", tourMiddleware, updateTour);
router.delete("/tours/:id", deleteTour);

// packages routes
router.get("/packages", getAllPackagesDetails);
router.get("/packages_tours", getPackageDetailsWithTours);
router.get("/detailed_package/:id", getPackageDetails);
router.get("/package/:id", getPackage);
router.get("/related_packages/:id", getRelatedPackages);
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
