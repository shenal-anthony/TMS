const pkg = require("../models/packageModel");
const jwt = require("jsonwebtoken");
const payment = require("../models/paymentModel");
const tourist = require("../models/touristModel");
const nodemailer = require("nodemailer");
const sanitizeHtml = require("sanitize-html");
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
  const {
    bookingId,
    paymentId,
    amount,
    paymentDate,
    touristId,
    paymentType,
    status,
    paidAmount,
  } = req.body;
  // console.log(
  // "🚀 ~ websiteController.js:279 ~ sendEmailToTourist ~ req.body:",
  // req.body
  // );

  try {
    // Validate and sanitize required fields
    const requiredFields = {
      bookingId,
      paymentId,
      amount,
      paymentDate,
      touristId,
      paymentType,
    };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => requiredFields[key] === undefined || requiredFields[key] === null
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields: missingFields.reduce(
          (acc, field) => ({ ...acc, [field]: true }),
          {}
        ),
      });
    }

    // Sanitize inputs
    const sanitizedBookingId = sanitizeHtml(bookingId);
    const sanitizedPaymentId = sanitizeHtml(paymentId);
    const sanitizedTouristId = sanitizeHtml(touristId.toString());

    // Validate payment type
    if (!["full", "half"].includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment type. Must be 'full' or 'half'",
      });
    }

    // Get and validate payment details
    const paymentResult = await payment.getPaymentById(sanitizedPaymentId);
    if (!paymentResult) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Convert and validate dates
    const submittedDate = new Date(paymentDate);
    if (isNaN(submittedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment date format",
      });
    }

    const storedDate = new Date(paymentResult.payment_date);
    if (
      submittedDate.toISOString().split("T")[0] !==
      storedDate.toISOString().split("T")[0]
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment date mismatch",
        submittedDate: submittedDate.toISOString().split("T")[0],
        storedDate: storedDate.toISOString().split("T")[0],
      });
    }

    // Validate amount
    const expectedAmount =
      paymentType === "half"
        ? Number(paymentResult.amount) * 2
        : Number(paymentResult.amount);
    if (Number(amount) !== expectedAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
        submittedAmount: amount,
        storedAmount: paymentResult.amount,
        expectedAmount: expectedAmount,
      });
    }

    // Get and validate tourist details
    const touristResult = await tourist.getTouristById(sanitizedTouristId);
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

    // Create email transporter
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: true,
        },
      });

      await transporter.verify();
    } catch (transportError) {
      console.error("Email transport creation failed:", transportError);
      return res.status(500).json({
        success: false,
        message: "Email service configuration error",
        error: "Failed to initialize email service",
      });
    }

    // Format dates and amounts
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
      currency: "LKR",
    }).format(amount);

    const formattedPaidAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(paidAmount);

    // Prepare email content based on payment type
    let paymentDetailsHtml = "";
    let paymentDetailsText = "";

    if (paymentType === "half") {
      const remainingAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "LKR",
      }).format(amount - paidAmount);

      const secondPaymentDate = new Date(paymentDate);
      secondPaymentDate.setDate(secondPaymentDate.getDate() + 7);
      const formattedSecondPaymentDate = secondPaymentDate.toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      paymentDetailsHtml = `
        <p>You have chosen to pay in installments. You have paid ${formattedPaidAmount} of the total ${formattedAmount}.</p>
        <p>The remaining ${remainingAmount} is due on ${formattedSecondPaymentDate}.</p>
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">Cancellation Policy</h3>
          <p>If you cancel your booking, a 10% cancellation fee (${new Intl.NumberFormat(
            "en-US",
            {
              style: "currency",
              currency: "LKR",
            }
          ).format(amount * 0.1)}) will be charged on the total amount.</p>
        </div>
      `;
      paymentDetailsText = `
You have chosen to pay in installments. You have paid ${formattedPaidAmount} of the total ${formattedAmount}.
The remaining ${remainingAmount} is due on ${formattedSecondPaymentDate}.

Cancellation Policy:
If you cancel your booking, a 10% cancellation fee (${new Intl.NumberFormat(
        "en-US",
        {
          style: "currency",
          currency: "LKR",
        }
      ).format(amount * 0.1)}) will be charged on the total amount.
      `;
    } else {
      paymentDetailsHtml = `<p>You have paid the full amount of ${formattedAmount}.</p>`;
      paymentDetailsText = `You have paid the full amount of ${formattedAmount}.`;
    }

    // Prepare email
    const mailOptions = {
      from: `Ceylonian Tours <${
        process.env.EMAIL_FROM || "noreply@ceyloniantours.com"
      }>`,
      to: touristEmail,
      subject: `Your Booking Confirmation - Payment ${
        paymentType === "full" ? "Completed" : "Partially Paid"
      }`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1a3c34; text-align: center; margin-bottom: 20px;">Ceylonian Tours</h1>
            <h2 style="color: #2c3e50;">Booking Confirmation</h2>
            <p>Dear ${sanitizeHtml(touristFirstName)} ${sanitizeHtml(
        touristLastName
      )},</p>
            <p>Thank you for choosing Ceylonian Tours! We're excited to confirm your booking.</p>
            <p style="font-weight: bold; color: #1a3c34;">We’ll contact you soon to discuss your booking details and ensure everything is perfectly arranged!</p>

            <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Summary</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Booking ID:</strong> ${sanitizedBookingId}</li>
                <li><strong>Payment ID:</strong> ${sanitizedPaymentId}</li>
                <li><strong>Amount:</strong> ${formattedAmount}</li>
                <li><strong>Payment Date:</strong> ${formattedPaymentDate}</li>
                <li><strong>Status:</strong> ${status}</li>
              </ul>
            </div>

            ${paymentDetailsHtml}

            <div style="margin: 20px 0;">
              <h3 style="color: #2c3e50;">Contact Us</h3>
              <p>If you have any questions or need assistance, please don't hesitate to reach out:</p>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Email:</strong> support@ceyloniantours.com</li>
                <li><strong>Phone:</strong> +94 11 234 5678</li>
                <li><strong>Address:</strong> 123 Galle Road, Colombo 03, Sri Lanka</li>
                <li><strong>Website:</strong> <a href="https://www.ceyloniantours.com">www.ceyloniantours.com</a></li>
              </ul>
            </div>

            <p style="text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px;">
              &copy; ${new Date().getFullYear()} Ceylonian Tours. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
Ceylonian Tours
Booking Confirmation

Dear ${sanitizeHtml(touristFirstName)} ${sanitizeHtml(touristLastName)},

Thank you for choosing Ceylonian Tours! We're thrilled to have you on board for an unforgettable journey.
We'll contact you soon to discuss your booking details and ensure everything is perfectly arranged!

Booking Summary:
Booking ID: ${sanitizedBookingId}
Payment ID: ${sanitizedPaymentId}
Amount: ${formattedAmount}
Payment Date: ${formattedPaymentDate}
Status: ${status}

${paymentDetailsText}

Contact Us:
Email: ceylonian@gmail.com
Phone: +94 77 123-4567
Address: 456 Wanderlust Avenue , Negombo, Sri Lanka
Website: https://www.ceyloniantours.com

© ${new Date().getFullYear()} Ceylonian Tours. All rights reserved.
      `,
      attachments: [],
    };

    // Send email with timeout
    const emailTimeout = setTimeout(() => {
      throw new Error("Email sending timed out");
    }, 10000);

    const emailResult = await transporter.sendMail(mailOptions);
    clearTimeout(emailTimeout);

    // Log successful email delivery
    console.log(`Email sent to ${touristEmail}`, {
      messageId: emailResult.messageId,
      bookingId: sanitizedBookingId,
      touristId: sanitizedTouristId,
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
