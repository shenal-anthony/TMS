const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createMulterMiddleware = (fieldsConfig) => {
  // Handle case when no file uploads are needed (regular form data)
  if (!fieldsConfig || fieldsConfig.length === 0) {
    return multer().none(); // This will parse multipart/form-data without files
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fieldConfig = fieldsConfig.find((field) => field.fieldName === file.fieldname);
      const uploadFolder = fieldConfig ? fieldConfig.folder : "others";
      const uploadPath = path.join(__dirname, "../public/uploads", uploadFolder);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
      console.log("Received file field:", file.fieldname);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG/PNG/WEBP files are allowed"), false);
    }
  };

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter,
  });

  // Construct the fields array for `upload.fields()`
  const fields = fieldsConfig.map(({ fieldName, maxCount }) => ({
    name: fieldName,
    maxCount: maxCount || 1, // Default to 1 if not specified
  }));

  return upload.fields(fields);
};

module.exports = createMulterMiddleware;