const express = require("express");
const router = express.Router();
const { getAllGuides, deleteGuide, changeGuideStatus } = require("../controllers/guideController");

router.get("/", getAllGuides);
router.delete("/:id", deleteGuide);
router.patch("/status/:id", changeGuideStatus);

module.exports = router;
