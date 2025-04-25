const pkg = require("../models/packageModel");
const jwt = require("jsonwebtoken");

// Secret key (store in environment variables!)
const JWT_SECRET = process.env.JWT_SECRET_02 || "your-secret-key";

// Generate initial booking token (without headcount)
function generateBookingToken(data) {
  try {
    const token = jwt.sign(data, JWT_SECRET, { expiresIn: "1h" });
    return { success: true, token };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token generation failed",
    };
  }
}

// Update booking token with headcount
function updateBookingToken(currentToken, headcount) {
  try {
    // Verify token and get decoded payload (including original expiration)
    const decoded = jwt.verify(currentToken, JWT_SECRET);

    // Create new token with the exact same expiration time
    const newToken = jwt.sign(
      {
        ...decoded,
        headcount,
        exp: decoded.exp, // Explicitly set the original expiration
      },
      JWT_SECRET
    );

    return {
      success: true,
      token: newToken,
      expiresAt: new Date(decoded.exp * 1000), // Convert to JS Date
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token update failed",
    };
  }
}

// Verify booking token
function verifyBookingToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, data: decoded };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid token",
    };
  }
}

const getVerifiedBookingToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required",
    });
  }

  try {
    const verification = verifyBookingToken(token);

    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        error: verification.error,
      });
    }

    // Token is valid - return the decoded data
    return res.status(200).json({
      success: true,
      pkgId: verification.data.pkgId,
      pkgName: verification.data.pkgName,
      price: verification.data.price,
      duration: verification.data.duration,
      accommodation: verification.data.accommodation,
      startDate: verification.data.startDate,
      initialDate: verification.data.iat,
      endDate: verification.data.exp,
      headcount: verification.data.headcount,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during token verification",
    });
  }
};

const getVerifiedCheckoutDetails = async (req, res) => {
  const { headcount, pkgId, token, price } = req.body;

  try {
    // Validate required fields
    if (!token || !pkgId || headcount === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: token, pkgId, and headcount are all required",
      });
    }

    // Update the token with headcount
    const result = updateBookingToken(token, headcount);
    if (!result.success) {
      return res.status(400).json({
        // Changed to 400 for client error
        success: false,
        message: "Invalid booking token",
        error: result.error,
      });
    }

    // Successful response
    res.json({
      success: true,
      headcount,
      price,
      expiresIn: result.expiresAt,
      bookingKey: result.token,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing checkout details",
      error: error.message,
    });
  }
};

// --- Controller Methods ---

// Get package details & generate booking key
const getPkgBookingKeyDetails = async (req, res) => {
  const { packageId, date } = req.body;
  const startDate = new Date(date).toISOString().split("T")[0]; // Format date to YYYY-MM-DD

  try {
    const content = await pkg.getPackageById(packageId);
    const isAvailable = true; // Replace with real availability logic

    const { success, token, error } = generateBookingToken({
      pkgId: content.package_id,
      pkgName: content.package_name,
      price: content.price,
      duration: content.duration,
      accommodation: content.accommodation_id,
      startDate: startDate,
    });

    if (!success) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate booking key",
        error,
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
      startDate: startDate,
      bookingKey: token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching package details",
      error: error.message,
    });
  }
};

// Get verified booking details using decoded token (assumes middleware adds req.bookingDetails & req.token)
const getVerifiedBookingDetails = async (req, res) => {
  try {
    const bookingDetails = req.bookingDetails;
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

// Get package details from ID in URL params
const getPkgDetails = async (req, res) => {
  const { id } = req.params;
  const bookingKey = req.headers["x-booking-key"];

  try {
    if (!bookingKey) {
      return res.status(401).json({
        success: false,
        message: "Booking key is required",
      });
    }

    const content = await pkg.getPackageById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const isAvailable = true;

    res.json({
      success: true,
      available: isAvailable,
      packageDetails: {
        packageId: content.package_id,
        packageName: content.package_name,
        accommodation: content.accommodation_id,
        price: content.price,
        duration: content.duration,
      },
      bookingKey,
    });
  } catch (error) {
    console.error("Package details error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching package details",
      error: error.message,
    });
  }
};



// Export all controller functions
module.exports = {
  getPkgBookingKeyDetails,
  getVerifiedBookingDetails,
  getPkgDetails,
  getVerifiedCheckoutDetails,
  getVerifiedBookingToken,
};
