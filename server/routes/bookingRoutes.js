const express = require("express");
const router = express.Router();
const { encryptResponse } = require("../middlewares/encryptResponse");
const {
  getAvailableGuidesByFilter,
  addGuideToBooking,
  changeGuideStatus,
} = require("../controllers/guideController");
const {
  getAllBookings,
  addBooking,
  deleteBooking,
  getPendingBookingsWithGuides,
  updateBooking,
  getConfirmedBookingsWithGuides,
} = require("../controllers/bookingController");
const {
  getPkgBookingKeyDetails,
  getVerifiedBookingToken,
  getVerifiedCheckoutDetails,
} = require("../controllers/websiteController");

// Route to get all admins from /api/bookings
router.get("/", getConfirmedBookingsWithGuides);
router.post("/add", encryptResponse, addBooking);
router.delete("/:id", deleteBooking);
router.post("/check-availability", getPkgBookingKeyDetails);
router.post("/verify-token", getVerifiedBookingToken);
router.post("/configured-booking", getVerifiedCheckoutDetails);
router.get("/pending", getPendingBookingsWithGuides);
router.post("/filtered-pending", getAvailableGuidesByFilter);
router.put("/:bookingId/assign", addGuideToBooking);
router.patch("/:id", updateBooking);
// router.get("/booking-details/:id", getPkgDetails);

module.exports = router;
