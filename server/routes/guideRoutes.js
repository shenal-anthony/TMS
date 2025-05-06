const express = require("express");
const router = express.Router();
const {
  getAllGuides,
  deleteGuide,
  changeGuideStatus,
  getGuideFinalizedBookings,
  getFinalizedBookingsById,
} = require("../controllers/guideController");

router.get("/", getAllGuides);
router.delete("/:id", deleteGuide);
router.patch("/status/:id", changeGuideStatus);
router.get("/finalized/:id", getGuideFinalizedBookings);
router.get("/finalized/details/:id", getFinalizedBookingsById);

module.exports = router;
