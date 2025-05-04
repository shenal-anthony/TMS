const express = require("express");
const {
  registerUser,
  loginUser,
  getAccessToken,
} = require("../controllers/authController");
const verifyJWT = require("../middlewares/verifyJWT");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// router.put("/edit-profile/:id", editProfile);

// Protected Dashboard route
router.get("/check-role", verifyJWT, (req, res) => {
  res.json({ userId: req.user.userId, role: req.user.role });
});
router.post("/refresh-token", getAccessToken);


module.exports = router;
