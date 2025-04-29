const booking = require("../models/bookingModel");
const guide = require("../models/assignedGuideModel");

// get all
const getAllBookings = async (req, res) => {
  try {
    const contents = await booking.getAllBookings();
    res.json(contents);
    // console.log(
    //   "🚀 ~ bookingController.js:15 ~ getAllBookings ~ contents:",
    //   contents
    // );
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
    console.log("🚀 ~ bookingController.js:110 ~ getPendingBookingsWithGuides ~ result:", result.length);

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
};
