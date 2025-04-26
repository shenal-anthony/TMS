const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const upload = require("../utils/multerConfig"); // Corrected multer import

router.post('/upload', upload.single('file'), uploadController.uploadFile);
router.get('/images', uploadController.getFiles);

module.exports = router;
