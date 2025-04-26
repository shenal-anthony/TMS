const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();

// Middleware imports
const bodyParser = require("body-parser");

// Route imports
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const guideRoutes = require("./routes/guideRoutes");
const contentRoutes = require("./routes/contentRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const touristRoutes = require("./routes/touristRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const port = process.env.PORT || 8001;

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/contents", contentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/tourists", touristRoutes);
app.use("/api/uploads", uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Server startup
app.listen(port, () => console.log(`Server running on port ${port}`));
