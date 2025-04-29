const user = require("../models/userModel");
const guide = require("../models/assignedGuideModel");
const booking = require("../models/bookingModel");
// api/guides/

// Get all guides
const getAllGuide = async (req, res) => {
  try {
    const guides = await user.getGuides();
    res.json(guides);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

// get available guides
const getAvailableGuidesByFilter = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required." });
    }

    // 1. Get all pending bookings
    const pendingBookings = await booking.getPendingBookings(); // must include booking_id, booking_date
    const result = [];

    // 2. For each booking, get guides available during that booking's span
    for (const booking of pendingBookings) {
      const bookingStart = new Date(booking.booking_date);
      const bookingEnd = new Date(bookingStart);
      bookingEnd.setDate(bookingEnd.getDate() + 3); // booking period

      // Check if booking period is inside the provided filter range
      if (
        bookingStart >= new Date(startDate) &&
        bookingEnd <= new Date(endDate)
      ) {
        const availableGuides = await guide.getUnassignedGuidesByPeriod(
          bookingStart.toISOString().split("T")[0],
          bookingEnd.toISOString().split("T")[0]
        );

        availableGuides.forEach((guide) => {
          result.push({
            booking_id: booking.booking_id,
            booking_date: booking.booking_date,
            guide_id: guide.user_id,
            first_name: guide.first_name,
            last_name: guide.last_name,
          });
        });
      }
    }
    console.log(
      "🚀 ~ guideController.js:24 ~ getAvailableGuidesByFilter ~ result:",
      result.length
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching available guides:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching available guides." });
  }
};

// add guide to a booking
const addGuideToBooking = async (req, res) => {
  const { guideId } = req.body;
  const bookingId = req.params.bookingId;

  if (!guideId || !bookingId) {
    return res
      .status(400)
      .json({ error: "Guide ID and Booking ID are required." });
  }

  try {
    // Fetch booking details
    const bookingData = await booking.getBookingById(bookingId);
    if (!bookingData) {
      return res.status(404).json({ error: "Booking not found." });
    }

    const startDate = new Date(bookingData.booking_date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 3); // 3-day duration

    // Assign guide to booking
    const assignedGuide = await guide.addAssignedGuide({
      guideId,
      bookingId,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });

    // Update booking status and assigned guide
    const updatedBooking = await booking.updateBookingById(bookingId, {
      status: "confirmed",
      user_id: guideId,
    });

    if (!updatedBooking) {
      return res
        .status(500)
        .json({ error: "Failed to update booking status." });
    }

    return res.status(201).json({
      message: "Guide assigned successfully.",
      data: assignedGuide,
    });
  } catch (error) {
    console.error("Error in addGuideToBooking:", error);
    return res.status(500).json({
      error: "Internal server error.",
      details: error.message || error,
    });
  }
};

const deleteGuide = async (req, res) => {
  const { id } = req.params;
  try {
    await user.deleteUserById(id);
    res.json({ message: "Guide deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting guide", error: error.message });
  }
};

module.exports = {
  getAllGuide,
  deleteGuide,
  getAvailableGuidesByFilter,
  addGuideToBooking,
};
