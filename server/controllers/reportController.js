// server/controllers/adminController.js
const user = require("../models/userModel");
const vehicle = require("../models/vehicleModel");
const booking = require("../models/bookingModel");

const getStatusCardData = async (req, res) => {
  try {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    const totalAdmins = await user.getAdminCount();
    const totalGuides = await user.getGuideCount();

    const totalVehicles = await vehicle.getVehicleCount();
    const functionalVehicles = await vehicle.getFunctionalCount();

    const pendingBookings = await booking.getPendingCount();
    const confirmedBookings = await booking.getConfirmedCount();
    const ongoingTours = await booking.getOngoingCount(date);

    const statusCards = [
      {
        title: "Admin Count",
        value: totalAdmins.toString(),
        icon: "AdminIcon",
      },
      {
        title: "Guide Count",
        value: totalGuides.toString(),
        icon: "AdminIcon",
      },
      {
        title: "Functional Vehicles",
        value: totalVehicles
          ? `${((functionalVehicles / totalVehicles) * 100).toFixed(2)}%`
          : "0%",
        icon: "VehicleIcon",
      },
      {
        title: "Confirmed Bookings",
        value:
          confirmedBookings + pendingBookings
            ? `${(
                (confirmedBookings / (confirmedBookings + pendingBookings)) *
                100
              ).toFixed(2)}%`
            : "0%",
        icon: "BookingIcon",
      },
      {
        title: "Ongoing Tours",
        value: ongoingTours.toString(),
        icon: "TourIcon",
      },
    ];

    res.json(statusCards);
  } catch (error) {
    console.error("Error fetching status card data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await user.deleteUserById(id);
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting admin", error: error.message });
  }
};

module.exports = { getStatusCardData };
