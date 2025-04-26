const pkg = require("../models/packageModel");
const jwt = require("jsonwebtoken");
const payment = require("../models/paymentModel");
const tourist = require("../models/touristModel");
const nodemailer = require("nodemailer");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET_02;
const emailFrom = process.env.EMAIL_FROM;
const emailUser = process.env.EMAIL_USER;
const appPassword = process.env.APP_PASSWORD;

if (!process.env.NAME) {
  console.error("Missing required environment variables");
  process.exit(1);
}

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
    const paymentResult = updateBookingToken(token, headcount);
    if (!paymentResult.success) {
      return res.status(400).json({
        // Changed to 400 for client error
        success: false,
        message: "Invalid booking token",
        error: paymentResult.error,
      });
    }

    // Successful response
    res.json({
      success: true,
      headcount,
      price,
      expiresIn: paymentResult.expiresAt,
      bookingKey: paymentResult.token,
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

const sendEmailToTourist = async (req, res) => {
  const { bookingId, paymentId, amount, paymentDate, touristId } = req.body;

  try {
    // Validate required fields
    if (
      !bookingId ||
      !paymentId ||
      amount === undefined ||
      !paymentDate ||
      touristId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields: {
          bookingId: !bookingId,
          paymentId: !paymentId,
          amount: amount === undefined,
          paymentDate: !paymentDate,
          touristId: touristId === undefined,
        },
      });
    }

    // Get and validate payment details
    const paymentResult = await payment.getPaymentById(paymentId);
    if (!paymentResult) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Convert dates to consistent format for comparison
    const submittedDate = new Date(paymentDate).toISOString().split("T")[0];
    const storedDate = new Date(paymentResult.payment_date)
      .toISOString()
      .split("T")[0];

    if (amount !== paymentResult.amount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
        submittedAmount: amount,
        storedAmount: paymentResult.amount,
      });
    }

    if (submittedDate !== storedDate) {
      return res.status(400).json({
        success: false,
        message: "Payment date mismatch",
        submittedDate,
        storedDate,
      });
    }

    // Get and validate tourist details
    const touristResult = await tourist.getTouristById(touristId);
    if (!touristResult || !touristResult.email_address) {
      return res.status(404).json({
        success: false,
        message: "Tourist record not found or missing email",
      });
    }

    const {
      email_address: touristEmail,
      first_name: touristFirstName,
      last_name: touristLastName,
    } = touristResult;

    // Create email transporter with proper error handling
    let transporter;
    try {
      console.log(emailUser, appPassword, emailFrom);
      transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: appPassword,
        },
        tls: {
          rejectUnauthorized: true,
        },
      });

      // Verify connection configuration
      await transporter.verify();
    } catch (transportError) {
      console.error("Email transport creation failed:", transportError);
      return res.status(500).json({
        success: false,
        message: "Email service configuration error",
        error: "Failed to initialize email service",
      });
    }

    // Format dates for display
    const formattedPaymentDate = new Date(paymentDate).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

    // Prepare email
    const mailOptions = {
      from: `Ceylonian Travel Team <${emailFrom}>`,
      to: touristEmail,
      subject: "Your Booking Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">Booking Confirmation</h1>
          <p>Dear ${touristFirstName} ${touristLastName},</p>
          <p>Thank you for your booking! Here are your details:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Summary</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Booking ID:</strong> ${bookingId}</li>
              <li><strong>Payment ID:</strong> ${paymentId}</li>
              <li><strong>Amount:</strong> ${formattedAmount}</li>
              <li><strong>Payment Date:</strong> ${formattedPaymentDate}</li>
            </ul>
          </div>

          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,</p>
          <p><strong>The Ceylonian Travel Team</strong></p>
        </div>
      `,
      text: `Dear ${touristFirstName} ${touristLastName},\n\nThank you for your booking!\n\nBooking ID: ${bookingId}\nPayment ID: ${paymentId}\nAmount: ${formattedAmount}\nPayment Date: ${formattedPaymentDate}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nThe Travel Team`,
      attachments: [], // Add any attachments if needed
    };

    // Send email with timeout
    const emailTimeout = setTimeout(() => {
      throw new Error("Email sending timed out");
    }, 10000); // 10 seconds timeout

    const emailResult = await transporter.sendMail(mailOptions);
    clearTimeout(emailTimeout);

    // Log successful email delivery
    console.log(`Email sent to ${touristEmail}`, {
      messageId: emailResult.messageId,
      bookingId,
      touristId,
    });

    return res.json({
      success: true,
      message: "Confirmation email sent successfully",
      email: touristEmail,
    });
  } catch (error) {
    console.error("Email sending error:", {
      error: error.message,
      stack: error.stack,
      bookingId,
      touristId,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to send confirmation email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
  sendEmailToTourist,
};
