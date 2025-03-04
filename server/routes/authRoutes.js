const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const verifyJWT = require("../middlewares/verifyJWT");

const router = express.Router();

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Dashboard route
router.get("/dashboard", verifyJWT, (req, res) => {
  res.json(req.user);
});

module.exports = router;
