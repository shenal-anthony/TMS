const { body, validationResult } = require("express-validator");

const validateVehicleRegistration = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("brand").notEmpty().withMessage("Brand is required"),
  body("model").notEmpty().withMessage("Model is required"),
  body("vehicleColor")
    .notEmpty()
    .isString()
    .withMessage("Invalid vehicle color"),
  body("vehicleType")
    .isIn(["car", "van", "jeep", "suv"])
    .withMessage("Invalid vehicle type"),
  body("fuelType")
    .isIn(["petrol", "diesel", "electric"])
    .withMessage("Invalid fuel type"),
  body("airCondition").isBoolean().withMessage("Invalid air condition value"),
  body("registrationNumber")
    .notEmpty()
    .withMessage("Registration number is required"),
  body("vehicleNumberPlate")
    .notEmpty()
    .withMessage("Vehicle number plate is required"),
];

module.exports = validateVehicleRegistration;
