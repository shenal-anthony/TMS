// const express = require("express");
// const { getDashboardData } = require("../controllers/dashboardController");
// const { verifyJWT } = require("../middlewares/verifyJWT");


// const router = express.Router();

// // Protected Dashboard route
// router.get("/dashboard", verifyJWT, getDashboardData);

// exports.router = router;


import express from "express";

const router = express.Router();

export default router;