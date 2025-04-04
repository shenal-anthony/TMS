const express = require("express");
const router = express.Router();
const {
  getAllBookings,
  addBooking,
  deleteBooking,
} = require("../controllers/bookingController");
const { getPackageDetails } = require("../controllers/websiteController");

// Route to get all admins from /api/bookings
router.get("/", getAllBookings);
router.post("/", addBooking);
router.delete("/:id", deleteBooking);

router.post("/check-availability", getPackageDetails);

module.exports = router;
