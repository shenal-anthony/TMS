const express = require("express");
const router = express.Router();
const {
  getAllBookings,
  addBooking,
  deleteBooking,
} = require("../controllers/bookingController");
const {
  getPkgBookingKeyDetails,
  getVerifiedBookingToken,
  getVerifiedCheckoutDetails,
} = require("../controllers/websiteController");
const verifyBooking = require("../middlewares/verifyBooking");
const { encryptResponse } = require("../middlewares/encryptResponse");

// Route to get all admins from /api/bookings
router.get("/", getAllBookings);
router.post("/add", encryptResponse, addBooking);
router.delete("/:id", deleteBooking);
router.post("/check-availability", getPkgBookingKeyDetails);
router.post("/verify-token", getVerifiedBookingToken);
router.post("/configured-booking", getVerifiedCheckoutDetails);

// router.get("/booking-details/:id", getPkgDetails);

module.exports = router;
