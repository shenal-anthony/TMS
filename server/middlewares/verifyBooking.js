// middleware/verifyBooking.js
const jwt = require('jsonwebtoken');

const verifyBooking = (req, res, next) => {
  const token = req.headers['x-booking-key'] || req.query.bookingKey || req.body.bookingKey;
  
  if (!token) {
    return res.status(403).json({ 
      success: false,
      message: "Booking key required" 
    });
  }

  try {
    req.booking = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      message: "Invalid/expired booking key" 
    });
  }
};

module.exports = verifyBooking;