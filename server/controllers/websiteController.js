const pkg = require("../models/packageModel");
const jwt = require("jsonwebtoken");

// Secret key (store in environment variables!)
const JWT_SECRET = process.env.JWT_SECRET_02 || "your-secret-key";

// Generate a JWT booking key
const generateBookingKey = (packageId, price, duration, accommodation) => {
  try {
    const payload = {
      pkgId: packageId,
      price: price,
      duration: duration,
      accommodation: accommodation,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    return {
      isSuccess: true,
      token: token,
      error: null,
    };
  } catch (error) {
    return {
      isSuccess: false,
      token: null,
      error: error.message,
    };
  }
};

// Get package details
const getPkgBookingKeyDetails = async (req, res) => {
  const { packageId } = req.body;

  try {
    const content = await pkg.getPackageById(packageId);
    const isAvailable = true; // Replace with real check

    const { isSuccess, token, error } = generateBookingKey(
      content.package_id,
      content.price,
      content.duration,
      content.accommodation_id
    );

    if (!isSuccess) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate booking key",
        error: error,
      });
    }

    res.json({
      success: true,
      available: isAvailable,
      packageId: content.package_id,

      packageName: content.package_name,
      accommodation: content.accommodation_id,
      price: content.price,
      duration: content.duration,

      bookingKey: token, // JWT token
      // isKeyGenerated: true // Explicit success flag for key generation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching package details",
      error: error.message,
    });
  }
};

// Get verified booking details from token
const getVerifiedBookingDetails = async (req, res) => {
  try {
    // The token is already verified by the middleware, just get the details
    const bookingDetails = req.bookingDetails;

    // Optional: Fetch fresh package details from DB if needed
    const content = await pkg.getPackageById(bookingDetails.pkgId);

    res.json({
      success: true,
      packageDetails: {
        packageId: content.package_id,
        packageName: content.package_name,
        accommodation: content.accommodation_id,
        price: content.price,
        duration: content.duration,
      },
      // Include the original token if needed
      bookingKey: req.token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking details",
      error: error.message,
    });
  }
};

module.exports = {
  getPkgBookingKeyDetails, getVerifiedBookingDetails
};