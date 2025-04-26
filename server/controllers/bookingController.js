const booking = require("../models/bookingModel");

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

module.exports = { getAllBookings, addBooking, deleteBooking };
