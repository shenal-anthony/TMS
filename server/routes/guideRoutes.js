const express = require("express");
const router = express.Router();
const {
  getAllGuides,
  deleteGuide,
  changeGuideStatus,
  getGuideFinalizedBookings,
  getFinalizedBookingsById,
  getAssignedBookingsByGuideId,
  getGuide,
} = require("../controllers/guideController");

router.get("/", getAllGuides);
router.get("/:id", getGuide);
router.delete("/:id", deleteGuide);
router.patch("/status/:id", changeGuideStatus);
router.get("/finalized/:id", getGuideFinalizedBookings);
router.get("/assigned/:id", getAssignedBookingsByGuideId);
router.get("/details/:id", getFinalizedBookingsById);

module.exports = router;
