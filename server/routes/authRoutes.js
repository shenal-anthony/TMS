const express = require("express");
const {
  registerUser,
  loginUser,
  getAccessToken,
} = require("../controllers/authController");
const {
  viewAllFeedbacks,
  uploadFiles,
} = require("../controllers/feedbackController");
const verifyJWT = require("../middlewares/verifyJWT");
const MulterMiddleware = require("../middlewares/uploadMiddleware");
const router = express.Router();

router.post(
  "/register",
  MulterMiddleware([
    { fieldName: "profilePicture", folder: "profile_pics", maxCount: 1 },
    { fieldName: "touristLicense", folder: "tourist_licenses", maxCount: 3 },
  ]),
  registerUser
);

const uploadMiddleware = MulterMiddleware([
  { fieldName: "profileImage", folder: "profile", maxCount: 1 },
  { fieldName: "documents", folder: "docs", maxCount: 3 },
]);

router.post("/upload/feedbacks", uploadMiddleware, uploadFiles);
router.post("/login", loginUser);
// router.put("/edit-profile/:id", editProfile);
// Protected Dashboard route
router.get("/check-role", verifyJWT, (req, res) => {
  res.json({ userId: req.user.userId, role: req.user.role });
});
router.post("/refresh-token", getAccessToken);
router.get("/view/feedbacks", viewAllFeedbacks);

module.exports = router;
