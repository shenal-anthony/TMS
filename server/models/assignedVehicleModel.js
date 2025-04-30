const pool = require("../db");
// assigned_vehicles table

// get all assigned guides
const getAssignedVehicles = async () => {
  const query = `SELECT * FROM assigned_vehicles`;
  const result = await pool.query(query);
  return result.rows;
};

// get unassigned guides by start date and end date
// const getUnassignedGuidesByPeriod = async (startDate, endDate) => {
//   const query = `
//       SELECT u.user_id, u.first_name, u.last_name
//       FROM users u
//       WHERE u.status = 'Active'
//         AND u.role = 'Guide'
//         AND u.user_id NOT IN (
//           SELECT ag.user_id
//           FROM assigned_guides ag
//           WHERE NOT (ag.end_date < $1 OR ag.start_date > $2)
//         )
//     `;
//   const values = [startDate, endDate];
//   const result = await pool.query(query, values);
//   return result.rows;
// };

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
};
