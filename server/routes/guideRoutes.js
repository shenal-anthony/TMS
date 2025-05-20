const express = require("express");
const router = express.Router();
const { getAllGuide, deleteGuide } = require("../controllers/guideController");

router.get("/", getAllGuide);
router.delete("/:id", deleteGuide);

module.exports = router;
