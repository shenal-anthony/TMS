const express = require("express");
const cors = require("cors");
const path = require("path");
// const sequelize = require("./config/database");

require("dotenv").config();

const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const fileUpload = require("express-fileupload");


const app = express();
const PORT = process.env.PORT || 8000;

// Sync database
// sequelize.sync().then(() => console.log("Database connected"));

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images




// Routes
app.use("/api/auth", authRoutes);


// Console output
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
