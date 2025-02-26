const express = require("express");
const cors = require("cors");
// const sequelize = require("./config/database");

require("dotenv").config();

const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

// Sync database
// sequelize.sync().then(() => console.log("Database connected"));

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);


// Default route (optional for testing)
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Console output
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
