const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();
const multer = require("multer");

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Or your frontend origin
    methods: ["GET", "POST"],
  },
});

// Import and use socket logic
require("./socket")(io);
// Store io for later use in routes/controllers if needed
app.set("io", io);
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
const reportRoutes = require("./routes/reportRoutes");

const port = process.env.PORT || 8001;

// Middlewares
const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173", 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


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
app.use("/api/reports", reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Server startup
server.listen(port, () => console.log(`Server running on port ${port}`));
