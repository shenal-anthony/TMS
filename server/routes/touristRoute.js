const express = require("express");
const router = express.Router();
const {
    getAllTourists,
    getTourist,
    registerTourist,
    deleteTourist,
} = require("../controllers/touristController");


// tourist routes
router.post("/register", registerTourist);

// router.get("/destination/:id", );


module.exports = router;
