const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();

const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes")
const fileUpload = require("express-fileupload");
const port = process.env.PORT || 8001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images


// Routes
app.use("/api/auth", authRoutes);
app.use('/api', adminRoutes);

// Console output
app.listen(port, () => console.log(`Server running on port ${port}`));
