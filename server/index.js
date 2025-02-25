const express = require("express");
const cors = require("cors");

require("dotenv").config();

const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);

// Console output
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
