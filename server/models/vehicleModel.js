const pool = require("../db");

const createVehicle = async (vehicleData) => {
  const {
    userId,
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
    vehiclePictureUrl,
    vehicleLicenseUrls,
    status,
  } = vehicleData;

  try {
    // Check for existing vehicle by registration number
    const existingVehicle = await pool.query(
      `SELECT * FROM vehicles WHERE REGISTRATION_NUMBER = $1`,
      [registrationNumber]
    );
    if (existingVehicle.rows.length > 0) {
      throw new Error("Vehicle with this registration number already exists");
    }

    // Insert vehicle
    const query = `
      INSERT INTO vehicles (
        USER_ID, BRAND, MODEL, COLOR, VEHICLE_TYPE, seat_capacity,
        luggage_capacity, FUEL_TYPE, AIR_CONDITION, REGISTRATION_NUMBER,
        NUMBER_PLATE, VEHICLE_PICTURE, TOURIST_LICENSE, STATUS
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`;
    const values = [
      userId,
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
      vehiclePictureUrl,
      vehicleLicenseUrls,
      status,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error in createVehicle:", error);
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
      SELECT vehicle_id, brand, model, color, vehicle_type, fuel_type, air_condition, registration_number, number_plate, status, service_due_date, service_end_date, seat_capacity, luggage_capacity
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

const changeStatusById = async (
  vehicleId,
  status,
  suspendStartDate,
  suspendEndDate
) => {
  try {
    const query = `
      UPDATE vehicles 
      SET status = $1, service_due_date = $2, service_end_date = $3 
      WHERE vehicle_id = $4 
      RETURNING *;
    `;
    const values = [
      status,
      suspendStartDate,
      suspendEndDate,
      vehicleId,
    ];
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
