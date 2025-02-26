const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables

const generateToken = (userId) => {
  const payload = { userId };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

module.exports = generateToken;
