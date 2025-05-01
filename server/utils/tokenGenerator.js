const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (userId, role) => {
  const payload = { userId, role };

  const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return newToken;
};

module.exports = generateToken;
