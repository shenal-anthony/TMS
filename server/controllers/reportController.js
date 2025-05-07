// server/controllers/adminController.js
const user = require("../models/userModel");
const vehicle = require("../models/vehicleModel");
const booking = require("../models/bookingModel");
const payment = require("../models/paymentModel");
const report = require("../models/reportModel");

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

const getReportsByFilter = async (req, res) => {
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

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching available guides:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching available guides." });
  }
};

// get chart data
const getChartData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const bookingData = await booking.getAllBookings();
    const paymentData = await payment.getAllPayments();

    const chartMap = new Map();

    // Process payments
    for (const payment of paymentData) {
      if (!payment.payment_date) continue;
      const dateObj = new Date(payment.payment_date);
      //   console.log(
      //     "🚀 ~ reportController.js:144 ~ getChartData ~ dateObj:",
      //     dateObj
      //   );
      if (start && end && (dateObj < start || dateObj > end)) continue;

      const date = dateObj.toISOString().split("T")[0];
      if (!chartMap.has(date)) {
        chartMap.set(date, { date, revenue: 0, tourists: 0, bookings: 0 });
      }
      chartMap.get(date).revenue += Number(payment.amount || 0);
    }

    // Process bookings
    for (const booking of bookingData) {
      // Tourist headcount by check-in date
      if (booking.check_in_date) {
        const checkInDateObj = new Date(booking.check_in_date);
        if (start && end && (checkInDateObj < start || checkInDateObj > end))
          continue;

        const date = checkInDateObj.toISOString().split("T")[0];
        if (!chartMap.has(date)) {
          chartMap.set(date, { date, revenue: 0, tourists: 0, bookings: 0 });
        }
        chartMap.get(date).tourists += Number(booking.headcount || 0);
      }

      // Booking count by booking_date
      if (booking.booking_date) {
        const bookingDateObj = new Date(booking.booking_date);
        if (start && end && (bookingDateObj < start || bookingDateObj > end))
          continue;

        const date = bookingDateObj.toISOString().split("T")[0];
        if (!chartMap.has(date)) {
          chartMap.set(date, { date, revenue: 0, tourists: 0, bookings: 0 });
        }
        chartMap.get(date).bookings += 1;
      }
    }

    const chartData = Array.from(chartMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    res.status(200).json(chartData);
    console.log(
      "🚀 ~ reportController.js:191 ~ getChartData ~ chartData:",
      chartData
    );
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ error: "Server error while fetching chart data." });
  }
};

// Get report history by user role
const getLogData = async (req, res) => {
  const { id } = req.params;
  //   console.log("🚀 ~ reportController.js:205 ~ getLogData ~ id:", id);

  try {
    // Fetch the user by ID
    const userData = await user.getUserById(id);
    // console.log(
    //   "🚀 ~ reportController.js:210 ~ getLogData ~ userData:",
    //   userData
    // );
    if (!userData) {
      return res.status(404).json({ error: "User not found." });
    }

    const role = userData.role;
    let reports;

    // Determine which reports to fetch based on role
    if (role === "SuperAdmin") {
      reports = await report.getAllReports();
    } else if (role === "Admin") {
      reports = await report.getReportsByRole(role);
    } else {
      return res.status(403).json({
        error:
          "Access denied. Only Admins and SuperAdmins can access report history.",
      });
    }

    res.status(200).json(reports);
    console.log(
      "🚀 ~ reportController.js:237 ~ getLogData ~ reports:",
      reports
    );
  } catch (error) {
    console.error("Error fetching report history:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching report history." });
  }
};

// Store report data
const storeReport = async (req, res) => {
  const reportDetails = req.body;

  try {
    const userData = await user.getUserById(reportDetails.user_id);
    const storedReport = await report.createReport({
      generatedDate: reportDetails.generated_date,
      startDate: reportDetails.start_date,
      endDate: reportDetails.end_date,
      comment: reportDetails.comment,
      reportData: reportDetails.report_data,
      reportType: reportDetails.report_type,
      userId: reportDetails.user_id,
      role: userData.role,
    });
    console.log(
      "🚀 ~ reportController.js:262 ~ storeReport ~ storedReport:",
      storedReport
    );

    res.status(201).json(storedReport);
  } catch (error) {
    console.error("Error storing report:", error);
    res.status(500).json({ error: "Server error while storing report." });
  }
};

//
const viewReport = async (req, res) => {
  const { id } = req.params;
  try {
    const reportData = await report.getReportById(id);
    if (!reportData) {
      return res.status(404).json({ error: "Report not found." });
    }
    res.status(200).json(reportData);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Server error while fetching report." });
  }
};

module.exports = {
  getStatusCardData,
  deleteAdmin,
  getReportsByFilter,
  getChartData,
  getLogData,
  storeReport,
  viewReport,
};
