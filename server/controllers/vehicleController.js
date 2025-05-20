const vehicle = require("../models/vehicleModel");
const user = require("../models/userModel");
const { body, validationResult } = require("express-validator");
const path = require("path");

const registerVehicle = async (req, res) => {
  try {
    const {
      email,
      brand,
      model,
      vehicleColor,
      vehicleType,
      seatCapacity,
      luggageCapacity,
      fuelType,
      airCondition,
      registrationNumber,
      vehicleNumberPlate,
    } = req.body;

    // Validation
    const errors = {};
    if (!email) errors.email = "Email is required";
    if (!brand) errors.brand = "Brand is required";
    if (!model) errors.model = "Model is required";
    if (!vehicleColor) errors.vehicleColor = "Vehicle color is required";
    if (!vehicleType) errors.vehicleType = "Vehicle type is required";
    if (!seatCapacity) errors.seatCapacity = "Seat capacity is required";
    if (!luggageCapacity)
      errors.luggageCapacity = "Luggage capacity is required";
    if (!fuelType) errors.fuelType = "Fuel type is required";
    if (!registrationNumber)
      errors.registrationNumber = "Registration number is required";
    if (!vehicleNumberPlate)
      errors.vehicleNumberPlate = "Vehicle number plate is required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Validate numeric fields
    const seatCapacityNum = parseInt(seatCapacity, 10);
    const luggageCapacityNum = parseFloat(luggageCapacity);
    if (isNaN(seatCapacityNum) || seatCapacityNum < 1) {
      return res
        .status(400)
        .json({ error: "Seat capacity must be at least 1" });
    }
    if (isNaN(luggageCapacityNum) || luggageCapacityNum < 0) {
      return res
        .status(400)
        .json({ error: "Luggage capacity cannot be negative" });
    }

    // Find user by email
    const userData = await user.findUserByEmail(email.trim().toLowerCase());
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Process files
    const fileFields = req.files || {};
    const vehiclePicture = fileFields["vehiclePicture"]?.[0] || null;
    const vehicleLicenses = fileFields["vehicleLicense"] || [];

    if (!vehiclePicture) {
      return res.status(400).json({ error: "Vehicle picture is required" });
    }
    if (vehicleLicenses.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one vehicle license is required" });
    }

    const vehiclePictureUrl = vehiclePicture
      ? path.join("/uploads/vehicle_pics", vehiclePicture.filename)
      : null;
    const vehicleLicenseUrls = vehicleLicenses.map((file) =>
      path.join("/uploads/vehicle_licenses", file.filename)
    );

    // Normalize text fields
    const normalizedData = {
      email: email.trim().toLowerCase(),
      brand: brand.trim().toLowerCase(),
      model: model.trim().toLowerCase(),
      vehicleColor: vehicleColor.trim().toLowerCase(),
      vehicleType: vehicleType.trim().toLowerCase(),
      fuelType: fuelType.trim().toLowerCase(),
      registrationNumber: registrationNumber.trim().toUpperCase(),
      vehicleNumberPlate: vehicleNumberPlate.trim().toUpperCase(),
      airCondition: airCondition === "true",
      seatCapacity: seatCapacityNum,
      luggageCapacity: luggageCapacityNum,
      userId: userData.user_id,
      vehiclePictureUrl: vehiclePictureUrl ? `${vehiclePictureUrl}` : null,
      vehicleLicenseUrls: vehicleLicenseUrls.map((url) => `${url}`).join(","),
      status: "Functional",
    };

    // Create vehicle
    const newVehicle = await vehicle.createVehicle(normalizedData);

    // console.log(
    //   "🚀 ~ vehicleController.js:113 ~ registerVehicle ~ normalizedData:",
    //   normalizedData
    // );

    res.status(201).json({
      message: "Vehicle registered successfully",
      vehicle: newVehicle,
    });
  } catch (error) {
    console.error("Vehicle registration failed:", error);
    if (error.message.includes("already exists")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Vehicle registration failed" });
  }
};

const getVehiclesForUser = async (req, res) => {
  const { id } = req.params;
  try {
    const vehicles = await vehicle.getVehiclesByUserId(id);
    if (vehicles.length === 0) {
      return res
        .status(200)
        .json({ message: "No vehicles found for this user" });
    }

    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error retrieving vehicles for user:", error);
    res.status(500).json({ message: "Error retrieving vehicles" });
  }
};

const getAllVehicles = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await user.getUserRoleById(id);
    // console.log("🚀 ~ vehicleController.js:148 ~ getAllVehicles ~ admin:", admin);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    if (admin.role !== "Admin" && admin.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    console.error("Error retrieving admin:", error);
    return res.status(500).json({ message: "Error retrieving admin" });
  }

  try {
    const vehicles = await vehicle.findAllVehicles();
    // console.log(
    //   "🚀 ~ vehicleController.js:145 ~ getAllVehicles ~ vehicles:",
    //   vehicles
    // );
    if (vehicles.length === 0) {
      return res.status(200).json({ message: "No vehicles found" });
    }

    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error retrieving all vehicles:", error);
    res.status(500).json({ message: "Error retrieving vehicles" });
  }
};

// Change vehicle status
const changeVehicleStatus = async (req, res) => {
  const { id } = req.params;
  const { status, suspend_start_date, suspend_end_date } = req.body;

  const validStatuses = ["Functional", "Suspended"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status. Valid statuses are: Functional, Suspended",
    });
  }

  // Validate dates when status is Suspended
  if (status === "Suspended") {
    if (!suspend_start_date || !suspend_end_date) {
      return res.status(400).json({
        message: "Suspension start and end dates are required when status is Suspended",
      });
    }

    const startDate = new Date(suspend_start_date);
    const endDate = new Date(suspend_end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date format for suspend_start_date or suspend_end_date",
      });
    }

    if (endDate < startDate) {
      return res.status(400).json({
        message: "Suspension end date cannot be before start date",
      });
    }
  }

  try {
    const updated = await vehicle.changeStatusById(
      id,
      status,
      suspend_start_date,
      suspend_end_date
    );
    if (!updated) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({
      message: "Vehicle status updated successfully",
      vehicle: updated,
    });
  } catch (error) {
    console.error("Error updating vehicle status:", error);
    res.status(500).json({
      message: "Error updating vehicle status",
      error: error.message,
    });
  }
};

module.exports = {
  registerVehicle,
  getVehiclesForUser,
  getAllVehicles,
  changeVehicleStatus,
};
