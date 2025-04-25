require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Middleware to encrypt response data
const encryptResponse = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = (data) => {
    // console.log("🚀 ~ encryptResponse.js:12 ~ encryptResponse ~ data:", data);
    if (data.success) {
      // Encrypt sensitive data
      const payload = {
        bookingId: data.bookingId,
        touristId: data.touristId,
        bookingDate: data.bookingDate,
        status: data.status,
        pkgId: data.pkgId,
        headcount: data.headcount,
      };
      
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      
      // Return encrypted response
      originalJson.call(res, {
        success: true,
        token: token,
        message: data.message
      });
    } else {
      originalJson.call(res, data);
    }
  };
  
  next();
};

// Middleware to decrypt incoming requests
const decryptRequest = (req, res, next) => {
  if (req.body.token) {
    try {
      const decoded = jwt.verify(req.body.token, JWT_SECRET);
      req.paymentData = decoded;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } else {
    next();
  }
};

module.exports = { encryptResponse, decryptRequest };