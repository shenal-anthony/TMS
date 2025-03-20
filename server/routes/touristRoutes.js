const express = require("express");
const router = express.Router();
const { getAllContent, deleteContent, addContent, updateContent } = require("../controllers/touristController");

// destinations routes 
router.get("/destinations", getAllContent);
router.post("/destinations", addContent);
router.put("/destinations/:id", updateContent);
router.delete("/destinations/:id", deleteContent);

// events routes

// packages routes

// reviews routes





module.exports = router;
