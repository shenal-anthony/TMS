const user = require("../models/userModel");
const guide = require("../models/assignedGuideModel");
const booking = require("../models/bookingModel");
const msg = require("../models/guideResponseModel");
const tourDes = require("../models/tourDestinationModel");
const tourAcc = require("../models/tourAccommodationModel");
const pkgDes = require("../models/packageDestinationModel");
const pkgAcc = require("../models/packageAccommodationModel");
const pkg = require("../models/packageModel");
const assignedVeh = require("../models/assignedVehicleModel");

// Get all guides
const getAllGuides = async (req, res) => {
  try {
    const guides = await user.getGuides();
    if (!guides || guides.length === 0) {
      return res.status(404).json({ message: "No guides found" });
    }
    res.json(guides);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

// get guide by id
const getGuide = async (req, res) => {
  const { id } = req.params;
  try {
    const guideData = await user.getGuideById(id);
    if (!guideData) {
      return res.status(404).json({ message: "Guide not found" });
    }
    res.json(guideData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching guide", error: error.message });
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
    // console.log(
    //   "🚀 ~ guideController.js:24 ~ getAvailableGuidesByFilter ~ result:",
    //   result.length
    // );

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
  const { guideId, vehicleId } = req.body;
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

    const { booking_date, tour_id } = bookingData;

    // Get destination and accommodation IDs
    const [destinationIds, accommodationIds] = await Promise.all([
      tourDes.getTourDestinations(tour_id),
      tourAcc.getTourAccommodations(tour_id),
    ]);

    // Get package IDs
    const [destPackageIds, accPackageIds] = await Promise.all([
      pkgDes.getPackageIdsByDestinations(destinationIds),
      pkgAcc.getPackageIdsByAccommodations(accommodationIds),
    ]);

    // Get common package IDs
    const packageIds = destPackageIds.filter((id) =>
      accPackageIds.includes(id)
    );

    // Get package details
    const packages = await pkg.getPackagesByIds(packageIds);
    console.log(
      "🚀 ~ guideController.js:138 ~ addGuideToBooking ~ packages:",
      packages
    );
    const selectedPackage = packages.length > 0 ? packages[0] : null;

    console.log(
      "🚀 ~ guideController.js:114 ~ addGuideToBooking ~ selectedPackage:",
      selectedPackage
    );

    // Calculate start_date and end_date
    const startDate = new Date(booking_date);
    let endDate = new Date(startDate);

    if (selectedPackage && selectedPackage.duration) {
      endDate.setDate(startDate.getDate() + selectedPackage.duration);
    } else {
      throw new Error(
        "Package duration is missing. Cannot calculate end date."
      );
    }

    // Assign guide to booking
    const assignedGuide = await guide.addAssignedGuide({
      guideId,
      bookingId,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });

    // Assign vehicle to booking if vehicleId is provided
    let assignedVehicle = null;
    if (vehicleId) {
      assignedVehicle = await assignedVeh.addAssignedVehicle({
        vehicleId,
        bookingId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });
    }

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
      message: "Guide and vehicle assigned successfully.",
      data: {
        assignedGuide,
        assignedVehicle,
      },
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

// Change guide status
const changeGuideStatus = async (req, res) => {
  const { id } = req.params;
  const { status, leave_start_date, leave_end_date } = req.body;

  const validStatuses = ["Active", "In Leave"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status. Valid statuses are: Active, In Leave",
    });
  }

  // Validate and prepare data
  if (status === "In Leave") {
    if (!leave_start_date || !leave_end_date) {
      return res.status(400).json({
        message:
          "Leave start and end dates are required when status is In Leave",
      });
    }

    const startDate = new Date(leave_start_date);
    const endDate = new Date(leave_end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date format for leave_start_date or leave_end_date",
      });
    }

    if (startDate < today || endDate < today) {
      return res.status(400).json({
        message: "Leave start and end dates cannot be in the past",
      });
    }

    if (endDate < startDate) {
      return res.status(400).json({
        message: "Leave end date cannot be before start date",
      });
    }
  }

  try {
    const updated = await user.changeStatusById(
      id,
      status,
      status === "In Leave" ? leave_start_date : null,
      status === "In Leave" ? leave_end_date : null
    );
    if (!updated) {
      return res.status(404).json({ message: "Guide not found" });
    }

    res.json({
      message: "Guide status updated successfully",
      guide: updated,
    });
  } catch (error) {
    console.error("Error updating guide status:", error);
    res.status(500).json({
      message: "Error updating guide status",
      error: error.message,
    });
  }
};

// get request for guide
const getGuideRequests = async (req, res) => {
  const { id } = req.params;
  try {
    const requests = await msg.getGuideRequestsByGuideId(id);
    if (!requests || requests.length === 0) {
      return res.status(404).json({ message: "No requests found" });
    }
    res.json(requests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching guide requests", error: error.message });
  }
};

// delete guide request
const deleteGuideRequest = async (req, res) => {
  const { bookingId, guideId } = req.params;

  if (!bookingId || !guideId) {
    return res.status(400).json({ message: "Missing bookingId or guideId" });
  }

  try {
    await msg.deleteGuideRequestByBookingId(bookingId, guideId);
    res.json({ message: "Guide request deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting booking", error: error.message });
  }
};

// get guides finalized bookings
const getGuideFinalizedBookings = async (req, res) => {
  const { id } = req.params;
  try {
    const bookings = await booking.getFinalizedBookingsByUserId(id);
    // console.log("🚀 ~ guideController.js:212 ~ getGuideFinalizedBookings ~ bookings:", bookings);
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }
    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching guide requests", error: error.message });
  }
};

// get assigned bookings by guide id
const getAssignedBookingsByGuideId = async (req, res) => {
  const { id } = req.params;
  try {
    const bookings = await booking.getAssignedBookingsByUserId(id);
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }
    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching guide requests", error: error.message });
  }
};

// get finalized bookings by id
const getFinalizedBookingsById = async (req, res) => {
  const { id } = req.params;
  try {
    const bookings = await booking.getBookingById(id);
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching finalized bookings",
      error: error.message,
    });
  }
};

module.exports = {
  getAllGuides,
  deleteGuide,
  getAvailableGuidesByFilter,
  addGuideToBooking,
  changeGuideStatus,
  getGuideRequests,
  deleteGuideRequest,
  getGuideFinalizedBookings,
  getFinalizedBookingsById,
  getAssignedBookingsByGuideId,
  getGuide,
};
