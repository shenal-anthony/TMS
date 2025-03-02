const express = require("express");
const cors = require("cors");

require("dotenv").config();

const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 8009;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
// app.use("/dashboard", authRoutes);

// Console output
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
