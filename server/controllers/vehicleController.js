const { createVehicle, getVehicles } = require("../models/vehicleModel");
const { findUserByEmail } = require("../models/userModel");
const path = require("path");

const registerVehicle = async (req, res) => {
  try {
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
      vehiclePicture,
      touristLicense,
    } = req.body;

    // Ensure required fields are present
    if (
      !email ||
      !brand ||
      !model ||
      !registrationNumber ||
      !vehicleNumberPlate
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find user_id from the database using email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user.user_id;

    console.log("User ID:", userId); // Debug

    let vehiclePicturePath = null;
    let touristLicensePath = null;

    // Handle file uploads
    if (req.files) {
      if (req.files.vehiclePicture) {
        const vehiclePicture = req.files.vehiclePicture;
        vehiclePicturePath = `/uploads/vehicles/${Date.now()}_${
          vehiclePicture.name
        }`;
        await vehiclePicture.mv(
          path.join(__dirname, "../public", vehiclePicturePath)
        );
      }

      if (req.files.touristLicense) {
        const touristLicense = req.files.touristLicense;
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
      message: "Vehicle registered successfully"
        
    });
  } catch (error) {
    console.error("Vehicle registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await getVehicles();
    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error retrieving vehicles:", error);
    res.status(500).json({ message: "Error retrieving vehicles" });
  }
};

module.exports = { registerVehicle, getAllVehicles };
