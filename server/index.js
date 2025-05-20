import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import helmet from "helmet";
import morgan from "morgan";
import generalRoutes from "./routes/generalRoutes.js";
import superRoutes from "./routes/superRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import guideRoutes from "./routes/guideRoutes.js";
import { Sequelize } from "sequelize";

// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


// Routes
app.use("/general", generalRoutes);
app.use("/super", superRoutes);
app.use("/admin", adminRoutes);
app.use("/guide", guideRoutes);

const PORT = process.env.PORT || 8009;

// PostgreSQL connection with Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
  });
  
  // Test database connection
  sequelize.authenticate()
    .then(() => console.log(`PostgreSQL Connected: ${process.env.DB_NAME}`))
    .catch(err => console.error("PostgreSQL Connection Error:", err));


// Console output
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
