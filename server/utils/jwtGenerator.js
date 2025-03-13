const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (userId) => {
  const payload = { userId };

  const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  // console.log("Token:", newToken); // Debug
  return newToken;
};

module.exports = generateToken;
