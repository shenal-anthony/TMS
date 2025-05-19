const express = require("express");
const router = express.Router();
const { encryptResponse } = require("../middlewares/encryptResponse");
const {
  getAvailableGuidesByFilter,
  addGuideToBooking,
  getGuideRequests,
  deleteGuideRequest,
} = require("../controllers/guideController");
const {
  addBooking,
  deleteBooking,
  getPendingBookingsWithGuides,
  updateBooking,
  getConfirmedBookingsWithGuides,
  getFinalizedBookingsWithGuides,
  getFinalizedBookingById,
  sendRequestToGuide,
  getAllGuideRequests,
getTourIdsByPackageId
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
router.get("/requests", getAllGuideRequests);
router.get("/requests/:id", getGuideRequests);

router.put("/:bookingId/assign", addGuideToBooking);

router.post("/add", encryptResponse, addBooking);
router.post("/check-availability", getPkgBookingKeyDetails);
router.post("/verify-token", getVerifiedBookingToken);
router.post("/configured-booking", getVerifiedCheckoutDetails);
router.post("/filtered-pending", getAvailableGuidesByFilter);
router.post("/sendrequest/:id", sendRequestToGuide);
router.post("/tour_by_package", getTourIdsByPackageId);
// router.get("/feasible-dates/:id", getFeasibleDates);

router.patch("/:id", updateBooking);

router.delete("/:id", deleteBooking);
router.delete("/requests/:bookingId/:guideId", deleteGuideRequest);


module.exports = router;
