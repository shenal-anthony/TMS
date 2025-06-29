const express = require("express");
const router = express.Router();
const { uploadFile, getFiles } = require("../controllers/uploadController");
const upload = require("../utils/multerConfig"); // Corrected multer import

router.post("/upload", upload.single("file"), uploadFile);
router.get("/images", getFiles);

module.exports = router;
