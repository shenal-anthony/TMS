const express = require("express");
const { loginUser } = require("../controllers/authController");
const { registerUser } = require("../controllers/userController");

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);


module.exports = router;
