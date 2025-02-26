const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const verifyJWT = require("../middlewares/verifyJWT");

const router = express.Router();

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Dashboard route
router.get("/dashboard", verifyJWT, (req, res) => {
    // User is authenticated, so we can send their data
    res.status(200).json({
        message: "Welcome to the Dashboard!",
        userId: req.user.userId, // Extract user info from JWT token
        name: req.user.name,
        email: req.user.email
    });
});


module.exports = router;
