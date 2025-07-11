const booking = require("../models/bookingModel");
const guide = require("../models/assignedGuideModel");
const payment = require("../models/paymentModel");
const user = require("../models/userModel");
const msg = require("../models/guideResponseModel");
const pkgDes = require("../models/packageDestinationModel");
const pkgAcc = require("../models/packageAccommodationModel");
const tourDes = require("../models/tourDestinationModel");
const tourAcc = require("../models/tourAccommodationModel");
const pkg = require("../models/packageModel");
const assignedVehicle = require("../models/assignedVehicleModel");
const pool = require("../db");

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

// get by id
const getFinalizedBookingById = async (req, res) => {
  const { id } = req.params;
  const guideId = req.query.guideId;

  try {
    // Get the booking by ID
    const bookingDetails = await booking.getBookingById(id);
    if (!bookingDetails) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if the booking is finalized
    if (bookingDetails.status !== "finalized") {
      return res.status(400).json({ message: "Booking is not finalized" });
    }

    // Optionally, validate the guide (if necessary)
    const guideData = await user.getGuideById(guideId);
    if (!guideData) {
      return res.status(404).json({ message: "Guide not found" });
    }

    // You can return both booking and guide data if needed
    return res.json({
      booking: bookingDetails,
      guide: guideData,
    });
  } catch (error) {
    console.error("Error fetching booking", error);
    return res.status(500).json({
      message: "Error fetching booking",
      error: error.message,
    });
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
      tourId: body.tourId,
      userId: body.userId || 1,
      eventId: body.eventId || 1,
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
  const { id } = req.params; // id is bookingId
  const { status, userId } = req.body;

  // Validate required fields
  if (!status || !userId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: status or userId",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update booking with current date as checkOutDate
    const bookingData = {
      checkOutDate: new Date(),
      status,
      userId,
    };
    const updatedBooking = await booking.updateBookingById(
      id,
      bookingData,
      client
    );
    if (!updatedBooking) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check payment records
    const payments = await payment.getPaymentsByBookingId(id, client);

    if (payments.length === 2) {
      // Verify one payment is 'half_paid' and one is 'pending'
      const hasHalfPaid = payments.some((p) => p.status === "half_paid");
      const hasPending = payments.some((p) => p.status === "pending");
      if (!hasHalfPaid || !hasPending) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Expected one 'half_paid' and one 'pending' payment",
        });
      }

      // Update the 'pending' payment to 'completed'
      const paymentData = { status: "completed" };
      const updatedPaymentCount = await payment.updatePaymentById(
        id,
        paymentData,
        client
      );

      if (updatedPaymentCount !== 1) {
        await client.query("ROLLBACK");
        return res.status(500).json({
          success: false,
          message: "Error updating pending payment",
        });
      }
    } else if (payments.length === 1) {
      console.log("Single payment found, skipping payment update");
    } else if (payments.length > 2) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Unexpected number of payments",
      });
    }

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      message:
        payments.length === 2
          ? "Booking and payment updated successfully"
          : "Booking updated successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating booking:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating booking",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// get booking with available guides
const getPendingBookingsWithGuides = async (req, res) => {
  try {
    // Extract startDate and endDate from query parameters
    const { startDate, endDate } = req.query;

    // Get all pending bookings
    let pendingBookings = await booking.getPendingBookings();

    // console.log(
    // "🚀 ~ bookingController.js:165 ~ getPendingBookingsWithGuides ~ pendingBookings:",
    // pendingBookings.length
    // );

    // Filter bookings by date range if provided
    if (startDate && endDate) {
      pendingBookings = pendingBookings.filter((booking) => {
        const bookingDate = new Date(booking.booking_date);
        return (
          bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate)
        );
      });
    }

    const allResults = await Promise.all(
      pendingBookings.map(async (booking) => {
        const { booking_id, booking_date, tour_id } = booking;

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
        const selectedPackage = packages.length > 0 ? packages[0] : null;

        // Calculate leave_date
        const bookingDate = new Date(booking_date);
        let leave_date = new Date(bookingDate);
        if (selectedPackage && selectedPackage.duration) {
          leave_date.setDate(bookingDate.getDate() + selectedPackage.duration);
        } else {
          leave_date.setDate(bookingDate.getDate() + 3);
        }

        // Fetch available guides and vehicles
        const [availableGuides, availableVehicles] = await Promise.all([
          guide.getUnassignedGuidesByPeriod(booking_date, leave_date),
          assignedVehicle.getUnassignedVehiclesByPeriod(
            booking_date,
            leave_date
          ),
        ]);

        // Prepare vehicles array
        const vehicles =
          availableVehicles.length > 0
            ? availableVehicles.map((vehicle) => ({
                vehicle_id: vehicle.vehicle_id,
                brand: vehicle.brand,
                model: vehicle.model,
                vehicle_type: vehicle.vehicle_type,
              }))
            : [{ vehicle_id: null, brand: "No Vehicle" }];

        // Create combinations
        let combinations;
        if (availableGuides.length > 0) {
          combinations = availableGuides.map((guide) => ({
            booking_id,
            booking_date,
            tour_id,
            guide_id: guide.user_id,
            first_name: guide.first_name,
            last_name: guide.last_name,
            vehicles,
          }));
        } else {
          combinations = [
            {
              booking_id,
              booking_date,
              tour_id,
              guide_id: null,
              first_name: "No Guide",
              last_name: "",
              vehicles,
            },
          ];
        }

        return combinations;
      })
    );

    // Flatten the results
    const result = allResults.flat();
    // console.log(
    // "🚀 ~ bookingController.js:249 ~ getPendingBookingsWithGuides ~ allResults:",
    // allResults.length
    // );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching pending bookings with guides:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get booking with assigned guides with amount
const getConfirmedBookingsWithGuides = async (req, res) => {
  try {
    const confirmedBookings = await booking.getConfirmedBookings();
    // // console.log(
    // // "🚀 ~ bookingController.js:116 ~ getConfirmedBookingsWithGuides ~ confirmedBookings:",
    // // confirmedBookings.length
    // // );

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
      // // console.log(
      // // "🚀 ~ bookingController.js:137 ~ getConfirmedBookingsWithGuides ~ assignedGuides:",
      // // assignedGuides.length
      // // );

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

      // // console.log("🚀 ~ Payments:", payments);
      // // console.log(
      // // "🚀 ~ bookingController.js:151 ~ getConfirmedBookingsWithGuides ~ totalAmount:",
      // // totalAmount
      // // );

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
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching confirmed bookings with guides:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get booking with assigned guides with amount
const getFinalizedBookingsWithGuides = async (req, res) => {
  try {
    const finalizedBookings = await booking.getFinalizedBookings();
    // // console.log(
    // // "🚀 ~ bookingController.js:237 ~ getFinalizedBookingsWithGuides ~ confirmedBookings:",
    // // finalizedBookings.length
    // // );

    const result = [];

    for (const booking of finalizedBookings) {
      const {
        booking_id,
        booking_date,
        headcount,
        check_in_date,
        check_out_date,
        tourist_id,
        tour_id,
        user_id,
        event_id,
      } = booking;

      // Get guides
      const assignedGuides = await guide.getAssignedGuidesByBookingId(
        booking_id
      );
      // // console.log(
      // // "🚀 ~ bookingController.js:261 ~ getFinalizedBookingsWithGuides ~ assignedGuides:",
      // // assignedGuides.length
      // // );

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

      for (const guide of assignedGuides) {
        result.push({
          booking_id,
          booking_date,
          headcount,
          check_in_date,
          check_out_date,
          tourist_id,
          tour_id,
          user_id,
          event_id,
          guide_id: guide.user_id,
          start_date: guide.start_date,
          end_date: guide.end_date,
          total_amount: totalAmount,
          payments,
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching finalized bookings with guides:", error);
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

// Send request to guide
const sendRequestToGuide = async (req, res) => {
  const { id } = req.params; // bookingId
  const { guideId } = req.query;

  try {
    // Optionally validate booking and guide here...

    // Emit real-time socket event
    const io = req.app.get("io");
    io.to(`guide_${guideId}`).emit("new-request", {
      bookingId: id,
      guideId,
      message: "You have a new guide request",
    });

    res.status(200).json({ message: "Request sent to guide via WebSocket" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send request",
      error: error.message,
    });
  }
};

// get all guide requests (for admin dashboard)
const getAllGuideRequests = async (req, res) => {
  try {
    const guideRequests = await msg.getAllGuideResponses();
    res.json(guideRequests);
  } catch (error) {
    console.error("Error fetching guide requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTourIdsByPackageId = async (req, res) => {
  try {
    const { packageId } = req.body; // Changed from req.params to req.body for POST

    // Validate packageId
    if (!packageId) {
      return res.status(400).json({ message: "packageId is required" });
    }

    // Get destination_ids from package_destination
    const destinationIds = await pkgDes.getDestinationIdsByPackageId(packageId);

    // Get accommodation_ids from package_accommodation
    const accommodationIds = await pkgAcc.getAccommodationIdsByPackageId(
      packageId
    );

    // Get tour_ids from tour_destination
    const tourIdsFromDestinations = await tourDes.getTourIdsByDestinationIds(
      destinationIds
    );

    // Get tour_ids from tour_accommodation
    const tourIdsFromAccommodations =
      await tourAcc.getTourIdsByAccommodationIds(accommodationIds);

    // Combine and find conjunction (intersection) of tour_ids
    const allTourIds = tourIdsFromDestinations.filter((tourId) =>
      tourIdsFromAccommodations.includes(tourId)
    );

    // // console.log(
    // //   "🚀 ~ bookingController.js:421 ~ getTourIdsByPackageId ~ tourIdsFromDestinations:",
    // //   tourIdsFromDestinations
    // // );
    // // console.log(
    // //   "🚀 ~ bookingController.js:406 ~ getTourIdsByPackageId ~ tourIdsFromAccommodations:",
    // //   tourIdsFromAccommodations
    // // );
    // // console.log(
    // //   "🚀 ~ bookingController.js:406 ~ getTourIdsByPackageId ~ allTourIds:",
    // //   allTourIds
    // // );

    // Return the result
    if (allTourIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No tours found for this package." });
    }

    return res.status(200).json({
      package_id: packageId,
      tour_ids: allTourIds,
    });
  } catch (error) {
    console.error("Error fetching tour IDs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// cancel booking
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const { status, userId } = req.body;

  if (!status || status !== "cancelled" || !userId) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid or missing fields: status must be 'cancelled' and userId is required",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const bookingData = {
      checkOutDate: new Date(),
      status,
      userId,
    };
    const updatedBooking = await booking.updateBookingById(
      id,
      bookingData,
      client
    );
    if (!updatedBooking) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const payments = await payment.getPaymentsByBookingId(id, client);

    if (payments.length === 2) {
      const hasHalfPaid = payments.some((p) => p.status === "half_paid");
      const hasPending = payments.some((p) => p.status === "pending");
      if (!hasHalfPaid || !hasPending) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Expected one 'half_paid' and one 'pending' payment",
        });
      }

      const halfPaidUpdateCount = await payment.updateHalfPaidPayment(
        id,
        client
      );
      const pendingUpdateCount = await payment.updatePendingPayment(id, client);

      if (halfPaidUpdateCount !== 1 || pendingUpdateCount !== 1) {
        await client.query("ROLLBACK");
        return res.status(500).json({
          success: false,
          message: "Error updating payments",
        });
      }
    } else if (payments.length === 1) {
      const hasCompleted = payments[0].status === "completed";
      if (!hasCompleted) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Expected single payment to have 'completed' status",
        });
      }

      const updatedPaymentCount = await payment.updateSinglePaymentByBookingId(
        id,
        client
      );

      if (updatedPaymentCount !== 1) {
        await client.query("ROLLBACK");
        return res.status(500).json({
          success: false,
          message: "Error updating payment",
        });
      }
    } else if (payments.length > 2) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Unexpected number of payments",
      });
    }

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      message:
        payments.length > 0
          ? "Booking cancelled and payments updated successfully"
          : "Booking cancelled successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error cancelling booking:", error);
    return res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// update booking guide
const updateBookingGuide = async (req, res) => {
  const { id } = req.params; // bookingId
  const { guideId } = req.body;

  // Validate required fields
  if (!guideId) {
    return res.status(400).json({
      success: false,
      message: "Missing required field: guideId",
    });
  }

  // check whether the guide is available
  const isGuideAvailable = await user.getGuideById(guideId);
  if (!isGuideAvailable) {
    return res.status(400).json({
      success: false,
      message: "Guide is not available",
    });
  }

  try {
    const updatedBooking = await booking.updateBookingById(id, guideId);
    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking guide updated successfully",
    });
  } catch (error) {
    console.error("Error updating booking guide:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating booking guide",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBookings,
  addBooking,
  deleteBooking,
  getPendingBookingsWithGuides,
  updateBooking,
  getConfirmedBookingsWithGuides,
  getFinalizedBookingsWithGuides,
  getFinalizedBookingById,
  sendRequestToGuide,
  getAllGuideRequests,
  getTourIdsByPackageId,
  cancelBooking,
  updateBookingGuide,
};
