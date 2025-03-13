const {
  createVehicle,
  getVehiclesByUserId,
  findAllVehicles,
} = require("../models/vehicleModel");
const { findUserByEmail } = require("../models/userModel");
const { body, validationResult } = require("express-validator");
const path = require("path");

const registerVehicle = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      email,
      brand,
      model,
      vehicleColor,
      vehicleType,
      fuelType,
      airCondition,
      registrationNumber,
      vehicleNumberPlate,
      agreeTerms,
    } = req.body;

    // Check if the user agreed to the terms
    if (agreeTerms !== "true") {
      return res
        .status(400)
        .json({ message: "You must agree to the terms and conditions" });
    }

    // Find user_id from the database using email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user.user_id;
    // console.log("User ID:", userId); // Debug

    let vehiclePicturePath = null;
    let touristLicensePath = null;

    // Handle file uploads
    if (req.files) {
      if (req.files.vehiclePicture) {
        const vehiclePicture = req.files.vehiclePicture;
        const allowedMimeTypes = ["image/jpeg", "image/png"];
        if (!allowedMimeTypes.includes(vehiclePicture.mimetype)) {
          return res
            .status(400)
            .json({ message: "Invalid file type for vehicle picture" });
        }

        // 16MB limit
        if (vehiclePicture.size > 16 * 1024 * 1024) {
          return res
            .status(400)
            .json({ message: "Vehicle picture size exceeds 16MB" });
        }
        vehiclePicturePath = `/uploads/vehicles/${Date.now()}_${
          vehiclePicture.name
        }`;
        await vehiclePicture.mv(
          path.join(__dirname, "../public", vehiclePicturePath)
        );
      }

      if (req.files.touristLicense) {
        const touristLicense = req.files.touristLicense;
        const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowedMimeTypes.includes(touristLicense.mimetype)) {
          return res
            .status(400)
            .json({ message: "Invalid file type for tourist license" });
        }
        if (touristLicense.size > 16 * 1024 * 1024) {
          // 16MB limit
          return res
            .status(400)
            .json({ message: "Tourist license size exceeds 16MB" });
        }
        touristLicensePath = `/uploads/vehicles/${Date.now()}_${
          touristLicense.name
        }`;
        await touristLicense.mv(
          path.join(__dirname, "../public", touristLicensePath)
        );
      }
    }

    // Create vehicle record in database
    const newVehicle = await createVehicle({
      userId,
      brand,
      model,
      vehicleColor,
      vehicleType,
      fuelType,
      airCondition: airCondition === "true",
      registrationNumber,
      vehicleNumberPlate,
      vehiclePicturePath,
      touristLicensePath,
    });

    res.status(201).json({
      message: "Vehicle registered successfully",
    });
  } catch (error) {
    console.error("Vehicle registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getVehiclesForUser = async (req, res) => {
  try {
    const userId = req.user.userId; // From the authenticated token
    // console.log("User ID:", userId); // Debug

    const vehicles = await getVehiclesByUserId(userId);
    // console.log("Vehicles:", vehicles); // Debug

    if (vehicles.length === 0) {
      return res
        .status(404)
        .json({ message: "No vehicles found for this user" });
    }

    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error retrieving vehicles:", error);
    res.status(500).json({ message: "Error retrieving vehicles" });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await findAllVehicles();
    // console.log("Vehicles:", vehicles); // Debug

    if (vehicles.length === 0) {
      return res.status(404).json({ message: "No vehicles found" });
    }

    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error retrieving vehicles:", error);
    res.status(500).json({ message: "Error retrieving vehicles" });
  }
};

module.exports = { registerVehicle, getVehiclesForUser, getAllVehicles };
