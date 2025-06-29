require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const encryptPaymentResponse = (req, res, next) => {
  const originalJson = res.json;

  res.json = (data) => {
    if (data.success && data.paymentId) {
      // Encrypt payment data
      const payload = {
        paymentId: data.paymentId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        status: data.status,
        bookingId: data.bookingId,
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      // Return encrypted response
      originalJson.call(res, {
        success: true,
        token: token,
        message: data.message,
      });
    } else {
      originalJson.call(res, data);
    }
  };

  next();
};



const decryptPaymentRequest = (req, res, next) => {
  // Check for token in body, headers, or query
  const token =
    req.body.paymentToken ||
    req.headers["x-payment-token"] ||
    req.query.paymentToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.paymentData = decoded; // Attach decrypted payment data
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired payment token",
      });
    }
  } else {
    next();
  }
};

module.exports = { encryptPaymentResponse, decryptPaymentRequest };