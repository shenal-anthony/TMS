const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJWT = (req, res, next) => {
  // Get the token from Authorization header
  const accessToken  = req.header("Authorization")?.split(" ")[1];

  // If no token is provided
  if (!accessToken) {
    return res
      .status(401)
      .json({ message: "Access denied, no token provided" });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next(); // Continue to the protected route
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = verifyJWT;
