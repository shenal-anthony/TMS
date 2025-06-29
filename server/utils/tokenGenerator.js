const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (userId, role) => {
  const payload = { userId, role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "6h",
  });

  return { accessToken, refreshToken };
};

module.exports = generateToken;
