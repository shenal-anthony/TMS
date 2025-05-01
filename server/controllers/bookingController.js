const booking = require("../models/bookingModel");
const guide = require("../models/assignedGuideModel");
const payment = require("../models/paymentModel");

// get all
const getAllBookings = async (req, res) => {
  try {
    const contents = await booking.getAllBookings();
    res.json(contents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching events", error: error.message });
  }
};

// add
const addBooking = async (req, res) => {
  const { body } = req;

  try {
    // Default values for required fields
    const bookingData = {
      headcount: body.headcount,
      checkInDate: body.bookingDate,
      checkOutDate:
        body.checkOutDate ||
        (() => {
          const date = new Date(body.bookingDate);
          date.setDate(date.getDate() + 7); // Adds 7 days
          return date;
        })(),
      status: body.status || "pending",
      touristId: body.touristId,
      tourId: body.tourId || 0,
      userId: body.userId || 0,
      eventId: body.eventId || 0,
      // createdAt: new Date(),
      // updatedAt: new Date(),
      // Add any other required fields with appropriate defaults
    };

    // Validate required fields
    if (!bookingData.touristId) {
      return res.status(400).json({ message: "touristId is required" });
    }

    const newBooking = await booking.addBooking(bookingData);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      token: newBooking.token,
      pkgId: body.pkgId,
      headcount: newBooking.headcount,
      bookingId: newBooking.booking_id,
      bookingDate: newBooking.check_in_date,
      checkOutDate: newBooking.check_out_date,
      status: newBooking.status,
      touristId: newBooking.tourist_id,
      tourId: newBooking.tour_id,
      userId: newBooking.user_id,
      eventId: newBooking.event_id,
    });
  } catch (error) {
    console.error("Error adding booking:", error);
    res.status(500).json({
      success: false,
      message: "Error adding booking",
      error: error.message,
    });
  }
};

// update
const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    // Default values for required fields
    const bookingData = {
      headcount: body.headcount,
      checkInDate: body.bookingDate,
      checkOutDate: body.checkOutDate,
      status: body.status,
      touristId: body.touristId,
      tourId: body.tourId,
      userId: body.userId,
      eventId: body.eventId,
    };

    const updatedBooking = await booking.updateBookingById(id, bookingData);
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking",
      error: error.message,
    });
  }
};

// get booking with assigned guides with amount
const getConfirmedBookingsWithGuides = async (req, res) => {
  try {
    const confirmedBookings = await booking.getConfirmedBookings();
    console.log(
      "🚀 ~ bookingController.js:116 ~ getConfirmedBookingsWithGuides ~ confirmedBookings:",
      confirmedBookings.length
    );

    const result = [];

    for (const booking of confirmedBookings) {
      const {
        booking_id,
        booking_date,
        headcount,
        check_in_date,
        check_out_date,
        tourist_id,
        tour_id,
        event_id,
      } = booking;

      // Get guides
      const assignedGuides = await guide.getAssignedGuidesByBookingId(
        booking_id
      );
      console.log(
        "🚀 ~ bookingController.js:137 ~ getConfirmedBookingsWithGuides ~ assignedGuides:",
        assignedGuides.length
      );

      // Get payments
      const rawPayments = await payment.getPaymentsByBookingId(booking_id);

      // Normalize: wrap single object into array
      const payments = Array.isArray(rawPayments)
        ? rawPayments
        : rawPayments
        ? [rawPayments]
        : [];

      let totalAmount = 0;
      for (const p of payments) {
        totalAmount += parseFloat(p.amount) || 0;
      }

      console.log("🚀 ~ Payments:", payments);
      console.log(
        "🚀 ~ bookingController.js:151 ~ getConfirmedBookingsWithGuides ~ totalAmount:",
        totalAmount
      );

      for (const guide of assignedGuides) {
        result.push({
          booking_id,
          booking_date,
          headcount,
          check_in_date,
          check_out_date,
          tourist_id,
          tour_id,
          event_id,
          guide_id: guide.user_id,
          start_date: guide.start_date,
          end_date: guide.end_date,
          total_amount: totalAmount,
          // payments, // Optional: include full payment details if needed
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching confirmed bookings with guides:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get booking with available guides
const getPendingBookingsWithGuides = async (req, res) => {
  try {
    // Get all pending bookings
    const pendingBookings = await booking.getPendingBookings();

    const allResults = await Promise.all(
      pendingBookings.map(async (booking) => {
        const { booking_id, booking_date } = booking;
        const leave_date = new Date(booking_date);
        leave_date.setDate(leave_date.getDate() + 3); // Adds 3 days to the booking date

        // by default, fetch available guides for booking period
        const availableGuides = await guide.getUnassignedGuidesByPeriod(
          booking_date,
          leave_date
        );

        return availableGuides.map((guide) => ({
          booking_id,
          booking_date: booking_date,
          guide_id: guide.user_id,
          first_name: guide.first_name,
          last_name: guide.last_name,
        }));
      })
    );

    // Flatten the nested arrays
    const result = allResults.flat();
    console.log(
      "🚀 ~ bookingController.js:110 ~ getPendingBookingsWithGuides ~ result:",
      result.length
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching pending bookings with guides:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// delete
const deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    await booking.deleteBookingById(id);
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting booking", error: error.message });
  }
};

module.exports = {
  getAllBookings,
  addBooking,
  deleteBooking,
  getPendingBookingsWithGuides,
  updateBooking,
  getConfirmedBookingsWithGuides,
};
