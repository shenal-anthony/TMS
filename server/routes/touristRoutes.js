const express = require("express");
const router = express.Router();
const { registerTourist } = require("../controllers/touristController");
const {
  validateTouristRegistration,
} = require("../middlewares/touristValidation");
const { makePayment } = require("../controllers/paymentController");
const { decryptRequest } = require("../middlewares/encryptResponse");

// tourist routes
router.post("/register", validateTouristRegistration, registerTourist);
router.post("/payment", decryptRequest, makePayment);

// router.get("/destination/:id", );

module.exports = router;
