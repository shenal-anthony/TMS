const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAccessToken,
  getAllRegisteredUsers,
  editProfile,
  getUser,
} = require("../controllers/authController");
const {
  viewAllFeedbacks,
  uploadFiles,
} = require("../controllers/feedbackController");
const verifyJWT = require("../middlewares/verifyJWT");
const MulterMiddleware = require("../middlewares/uploadMiddleware");

// Protected Dashboard route
router.get("/check-role", verifyJWT, (req, res) => {
  res.json({ userId: req.user.userId, role: req.user.role });
});

const registerMiddleware = MulterMiddleware([
  { fieldName: "profilePicture", folder: "profile_pics", maxCount: 1 },
  { fieldName: "touristLicense", folder: "tourist_licenses", maxCount: 3 },
]);
router.post("/register", registerMiddleware, registerUser);

const uploadMiddleware = MulterMiddleware([
  { fieldName: "profileImage", folder: "profile", maxCount: 1 },
  { fieldName: "documents", folder: "docs", maxCount: 3 },
]);
router.post("/upload/feedbacks", uploadMiddleware, uploadFiles);

// router.put("/edit-profile/:id", editProfile);
router.post("/login", loginUser);
router.post("/refresh-token", getAccessToken);
router.get("/view/feedbacks", viewAllFeedbacks);
router.get("/users", getAllRegisteredUsers);
router.patch("/edit-profile/:id", registerMiddleware, editProfile);
router.get("/user/:id", getUser);

module.exports = router;
