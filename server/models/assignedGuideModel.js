const pool = require("../db");
// assigned_guides table

// get all assigned guides
const getAssignedGuides = async () => {
  const query = `SELECT * FROM assigned_guides`;
  const result = await pool.query(query);
  return result.rows;
};

// get assigned guides by booking id
const getAssignedGuidesByBookingId = async (bookingId) => {
  const query = `SELECT * FROM assigned_guides WHERE booking_id = $1`;
  const values = [bookingId];
  const result = await pool.query(query, values);
  return result.rows;
};

// get unassigned guides by start date and end date
const getUnassignedGuidesByPeriod = async (startDate, endDate) => {
  const query = `
      SELECT u.user_id, u.first_name, u.last_name
      FROM users u
      WHERE 
      u.user_id NOT IN (
        SELECT u.user_id
        FROM users u
        WHERE NOT (u.leave_end_date < $1 OR u.leave_due_date > $2)
      )
      AND u.role = 'Guide'
      AND u.user_id NOT IN (
        SELECT ag.user_id
        FROM assigned_guides ag
        WHERE NOT (ag.end_date < $1 OR ag.start_date > $2)
      )
    `;
  const values = [startDate, endDate];
  const result = await pool.query(query, values);
  return result.rows;
};

// get assigned bookings by guide id
const getAssignedBookingsByUserId = async (guideId) => {
  const query = `
      SELECT * FROM assigned_guides WHERE user_id = $1
    `;
  const values = [guideId];
  const result = await pool.query(query, values);
  return result.rows;
};

// add guide to booking
const addAssignedGuide = async (assignedGuideData) => {
  const { guideId, bookingId, startDate, endDate } = assignedGuideData;
  const query = `INSERT INTO assigned_guides (user_id, booking_id, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = [guideId, bookingId, startDate, endDate];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// update assigned guide status
const removeAssignedGuide = async (id) => {
  const query = `DELETE FROM assigned_guides WHERE id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  getAssignedGuides,
  addAssignedGuide,
  removeAssignedGuide,
  getUnassignedGuidesByPeriod,
  getAssignedGuidesByBookingId,
  getAssignedBookingsByUserId,
};
