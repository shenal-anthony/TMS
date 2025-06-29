const express = require("express");
const router = express.Router();
const { registerTourist } = require("../controllers/touristController");
const { makePayment } = require("../controllers/paymentController");
const { sendEmailToTourist } = require("../controllers/websiteController");
const { decryptRequest } = require("../middlewares/encryptResponse");
const {
  validateTouristRegistration,
} = require("../middlewares/touristValidation");

// tourist routes
router.post("/register", validateTouristRegistration, registerTourist);
router.post("/payment", decryptRequest, makePayment);
router.post("/confirm-booking", sendEmailToTourist);

// router.get("/destination/:id", );

module.exports = router;
