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
    console.log(
      "🚀 ~ paymentController.js:16 ~ makePayment ~ req.paymentData:",
      req.paymentData
    );

    // Get payment details from request body
    const {
      method,
      cardNumber,
      expiry,
      cvv,
      bankName,
      accountNumber,
      paymentType,
    } = req.body;
    console.log(
      "🚀 ~ paymentController.js:20 ~ makePayment ~ req.body:",
      req.body
    );

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
          message:
            "Card number, expiry and CVV are required for credit card payments",
        });
      }
      // Additional card validation logic could go here
    } else if (method === "bank") {
      if (!bankName || !accountNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Bank name and account number are required for bank transfer",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    let paymentRecords = [];
    let paidAmount, state;

    if (paymentType === "half") {
      paidAmount = amount / 2;

      // First payment (immediate)
      const firstPaymentData = {
        amount: paidAmount,
        paymentDate: new Date(),
        status: "half_paid",
        bookingId: bookingId,
      };

      // Second payment (due in 7 days)
      const secondPaymentDate = new Date();
      secondPaymentDate.setDate(secondPaymentDate.getDate() + 7);

      const secondPaymentData = {
        amount: paidAmount,
        paymentDate: secondPaymentDate,
        status: "pending",
        bookingId: bookingId,
      };

      // Create both payment records
      const [firstPayment, secondPayment] = await Promise.all([
        payment.addPayment(firstPaymentData),
        payment.addPayment(secondPaymentData),
      ]);

      paymentRecords = [firstPayment, secondPayment];
    } else if (paymentType === "full") {
      paidAmount = amount;
      state = "completed";

      // Single payment record
      const paymentData = {
        amount: paidAmount,
        paymentDate: new Date(),
        status: state,
        bookingId: bookingId,
      };

      const newPayment = await payment.addPayment(paymentData);
      paymentRecords = [newPayment];
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment type",
      });
    }

    console.log(
      "🚀 ~ paymentController.js:65 ~ makePayment ~ paymentRecords:",
      paymentRecords
    );

    // Prepare response data (using first payment for main response)
    const primaryPayment = paymentRecords[0];
    const responseData = {
      success: true,
      message: "Payment created successfully",
      paymentId: primaryPayment.payment_id,
      amount: amount,
      paidAmount: primaryPayment.amount,
      paymentDate: primaryPayment.payment_date,
      status: primaryPayment.status,
      bookingId: primaryPayment.booking_id,
      ...(paymentType === "half" && {
        secondPayment: {
          paymentId: paymentRecords[1].payment_id,
          amount: paymentRecords[1].amount,
          paymentDate: paymentRecords[1].payment_date,
          status: paymentRecords[1].status,
        },
      }),
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
