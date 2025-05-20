const pool = require("../db");
// assigned_vehicles table

// get all assigned guides
const getAssignedVehicles = async () => {
  const query = `SELECT * FROM assigned_vehicles`;
  const result = await pool.query(query);
  return result.rows;
};

const getUnassignedVehiclesByPeriod = async (startDate, endDate) => {
  try {
    const query = `
      SELECT 
        v.vehicle_id,
        v.brand,
        v.model,
        v.air_condition,
        v.user_id,
        v.vehicle_type,
        v.seat_capacity,
        v.luggage_capacity
      FROM vehicles v
      WHERE v.vehicle_id NOT IN (
          SELECT v.vehicle_id
          FROM vehicles v
          WHERE NOT (v.service_end_date < $1 OR v.service_due_date > $2)
        ) 
        AND v.vehicle_id NOT IN (
          SELECT av.vehicle_id
          FROM assigned_vehicles av
          WHERE NOT (av.end_date < $1 OR av.start_date > $2)
        )
    `;
    const values = [startDate, endDate];
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("Error fetching unassigned vehicles:", error);
    throw new Error("Failed to fetch unassigned vehicles");
  }
};

// add guide to booking
const addAssignedVehicle = async (assignedVehicleData) => {
  const { vehicleId, bookingId, startDate, endDate } = assignedVehicleData;
  const query = `INSERT INTO assigned_vehicles (vehicle_id, booking_id, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = [vehicleId, bookingId, startDate, endDate];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// update assigned vehicle status
const removeAssignedVehicle = async (id) => {
  const query = `DELETE FROM assigned_vehicles WHERE id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  getAssignedVehicles,
  removeAssignedVehicle,
  addAssignedVehicle,
  getUnassignedVehiclesByPeriod,
};
