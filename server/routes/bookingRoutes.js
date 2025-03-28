const express = require("express");
const router = express.Router();
const { getAllBookings, addBooking, deleteBooking } = require("../controllers/bookingController");

// Route to get all admins
router.get("/", getAllBookings);
router.post("/", addBooking)
router.delete("/:id", deleteBooking);


module.exports = router;