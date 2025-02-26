const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJWT = (req, res, next) => {
    // Get the token from Authorization header
    const token = req.header("Authorization");

    // If no token is provided
    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    // Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the user info to the request object
        next(); // Continue to the protected route
    } catch (error) {
        return res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = verifyJWT;
