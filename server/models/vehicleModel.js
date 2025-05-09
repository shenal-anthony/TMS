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

const getVehiclesByUserId = async (userId) => {
  try {
    const query = `
      SELECT * FROM vehicles WHERE user_id = $1;
    `;
    const values = [userId];
    const result = await pool.query(query, values);
    // console.log("🚀 ~ vehicleModel.js:54 ~ getVehiclesByUserId ~ result:", result);
    return result.rows;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
};

const findAllVehicles = async () => {
  try {
    const query = `
      SELECT vehicle_id, brand, model, color, vehicle_type, fuel_type, air_condition, registration_number, number_plate, status
      FROM vehicles;
    `;
    const result = await pool.query(query);
    // console.log("🚀 ~ vehicleModel.js:67 ~ findAllVehicles ~ result:", result);
    return result.rows;
  } catch (error) {
    console.error("Error fetching all vehicles:", error);
    throw error;
  }
};

const changeStatusById = async (vehicleId, status) => {
  try {
    const query = `
      UPDATE vehicles SET status = $1 WHERE vehicle_id = $2 RETURNING *;
    `;
    const values = [status, vehicleId];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error changing vehicle status:", error);
    throw error;
  }
};

const getFunctionalCount = async () => {
  const query = `SELECT COUNT(*) AS functional_count FROM vehicles WHERE status = $1`;
  const values = ["Functional"];
  const result = await pool.query(query, values);
  return parseInt(result.rows[0].functional_count, 10); // Convert to a number
};

const getVehicleCount = async () => {
  const query = `SELECT COUNT(*) AS vehicle_count FROM vehicles`;
  const result = await pool.query(query);

  return parseInt(result.rows[0].vehicle_count, 10); // Convert to a number
};

module.exports = {
  createVehicle,
  getVehiclesByUserId,
  findAllVehicles,
  changeStatusById,
  getFunctionalCount,
  getVehicleCount,
};
