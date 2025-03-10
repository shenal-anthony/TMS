const pool = require("../db");

const createVehicle = async (vehicleData) => {
  const {
    userId,
    brand,
    model,
    vehicleColor,
    vehicleType,
    fuelType,
    airCondition,
    registrationNumber,
    vehicleNumberPlate,
    vehiclePicturePath,
    touristLicensePath,
  } = vehicleData;

  const query = `
    INSERT INTO vehicles 
    (user_id, brand, model, color, vehicle_type, fuel_type, air_condition, registration_number, number_plate, vehicle_picture, tourist_license)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `;

  const values = [
    userId,
    brand,
    model,
    vehicleColor,
    vehicleType,
    fuelType,
    airCondition,
    registrationNumber,
    vehicleNumberPlate,
    vehiclePicturePath,
    touristLicensePath,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const getVehicles = async () => {
  try {
    const query = "SELECT * FROM vehicles;";
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

module.exports = { createVehicle, getVehicles };