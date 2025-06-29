const pool = require("../db");

// bookingModel.js
const getPendingBookingsWithGuides = async () => {
  const query = `
      SELECT b.booking_id, g.user_id AS available_guide_id, g.name AS available_guide_name
      FROM bookings b
      LEFT JOIN users u ON b.available_guide_id = u.user_id
      WHERE b.status = 'pending'
    `;
  const result = await db.query(query);
  return result.rows;
};

module.exports = {
  getPendingBookingsWithGuides,
};
