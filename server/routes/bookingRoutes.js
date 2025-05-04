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
  getFinalizedBookingsWithGuides,
  getFinalizedBookingById,
  sendRequestToGuide,
} = require("../controllers/bookingController");
const {
  getPkgBookingKeyDetails,
  getVerifiedBookingToken,
  getVerifiedCheckoutDetails,
} = require("../controllers/websiteController");

// Route to get all admins from /api/bookings
router.get("/", getConfirmedBookingsWithGuides);
router.get("/finalized", getFinalizedBookingsWithGuides);
router.get("/finalized/:id", getFinalizedBookingById);
router.get("/pending", getPendingBookingsWithGuides);

router.put("/:bookingId/assign", addGuideToBooking);

router.post("/add", encryptResponse, addBooking);
router.post("/check-availability", getPkgBookingKeyDetails);
router.post("/verify-token", getVerifiedBookingToken);
router.post("/configured-booking", getVerifiedCheckoutDetails);
router.post("/filtered-pending", getAvailableGuidesByFilter);
router.post("/sendrequest/:id", sendRequestToGuide);

router.patch("/:id", updateBooking);

router.delete("/:id", deleteBooking);

module.exports = router;
