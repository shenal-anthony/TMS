const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const verifyJWT = require("../middlewares/verifyJWT");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// router.put("/edit-profile/:id", editProfile);

// Protected Dashboard route
router.get("/dashboard", verifyJWT, (req, res) => {
  res.json(req.user);
  // console.log("🚀 ~ authRoutes.js:17 ~ router.get ~ req:", req);
  // console.log("🚀 ~ authRoutes.js:19 ~ router.get ~ res:", res);
});

module.exports = router;
