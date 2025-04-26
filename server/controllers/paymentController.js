const payment = require("../models/paymentModel");
const pkg = require("../models/packageModel");

const makePayment = async (req, res) => {
  try {
    // Check if we have decrypted booking data from middleware
    if (!req.paymentData) {
      return res.status(400).json({
        success: false,
        message: "No valid booking token provided",
      });
    }

    // Extract necessary data from the decrypted token
    const { bookingId, touristId, pkgId, headcount } = req.paymentData;

    // Get payment details from request body
    const { method, cardNumber, expiry, cvv, bankName, accountNumber } = req.body;

    // Validate required fields
    if (!bookingId || !touristId || !pkgId || !headcount) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking token - missing required fields",
      });
    }

    if (!method) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    // Get package price and calculate total amount
    const package = await pkg.getPackageById(pkgId);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const amount = package.price * headcount;

    // Validate payment method specific fields
    if (method === "credit") {
      if (!cardNumber || !expiry || !cvv) {
        return res.status(400).json({
          success: false,
          message: "Card number, expiry and CVV are required for credit card payments",
        });
      }
      // Additional card validation logic could go here
    } else if (method === "bank") {
      if (!bankName || !accountNumber) {
        return res.status(400).json({
          success: false,
          message: "Bank name and account number are required for bank transfer",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // Create payment record
    const paymentData = {
      amount: amount,
      paymentDate: new Date(),
      status: "completed", // or "pending" depending on your flow
      bookingId: bookingId,
    };

    const newPayment = await payment.addPayment(paymentData);

    // Encrypt sensitive data in response
    const responseData = {
      success: true,
      message: "Payment created successfully",
      paymentId: newPayment.payment_id,
      amount: newPayment.amount,
      paymentDate: newPayment.payment_date,
      status: newPayment.status,
      bookingId: newPayment.booking_id,
    };

    res.status(201).json(responseData);

  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing payment",
      error: error.message,
    });
  }
};

module.exports = {
  makePayment,
};