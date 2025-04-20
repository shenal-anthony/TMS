const express = require("express");
const router = express.Router();
const {
    getAllTourists,
    getTourist,
    registerTourist,
    deleteTourist,
} = require("../controllers/touristController");
const { validateTouristRegistration } = require("../middlewares/touristValidation");
const { getPaymentDetails } = require("../controllers/websiteController");


// tourist routes
router.post("/register", validateTouristRegistration, registerTourist);
router.post("/payment", getPaymentDetails);


// router.get("/destination/:id", );

module.exports = router;
