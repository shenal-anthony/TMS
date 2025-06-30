const pool = require("../db");

// Save new guide request (admin side)
const saveGuideRequest = async ({ guideId, bookingID, sentAt }) => {
  const query = `
      INSERT INTO guide_responses (guide_id, booking_id, status, sent_at)
      VALUES ($1, $2, FALSE, $3)
      ON CONFLICT (guide_id, booking_id)
      DO UPDATE SET sent_at = EXCLUDED.sent_at
    `;
  const values = [guideId, bookingID, sentAt];

  try {
    await pool.query(query, values);
    console.log("Guide request saved to DB with sent_at: ", sentAt);
  } catch (err) {
    console.error("Error saving guide request:", err);
  }
};

// Guide responds to request
const updateGuideResponse = async (guideId, bookingId, status) => {
  const query = `
    UPDATE guide_responses
    SET status = $3,
    updated_at = NOW()
    WHERE guide_id = $1 AND booking_id = $2
  `;
  const values = [guideId, bookingId, status];

  try {
    await pool.query(query, values);
    console.log("Guide response inserted with updated_at");
  } catch (err) {
    console.error("Error inserting guide response:", err);
  }
};

// Get all guide responses (for admin dashboard)
const getAllGuideResponses = async () => {
  const query = `SELECT * FROM guide_responses`;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error("Error fetching guide responses:", err);
    throw err;
  }
};

// get guide requests by guide id (for guide dashboard)
const getGuideRequestsByGuideId = async (guideId) => {
  const query = `SELECT * FROM guide_responses WHERE guide_id = $1`;
  const values = [guideId];
  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (err) {
    console.error("Error fetching guide responses:", err);
    throw err;
  }
};

// delete guide request by booking id
const deleteGuideRequestByBookingId = async (bookingId, guideId) => {
  const query = `DELETE FROM guide_responses WHERE booking_id = $1 AND guide_id = $2`;
  const values = [bookingId, guideId];
  try {
    await pool.query(query, values);
    console.log("Guide request deleted successfully");
  } catch (err) {
    console.error("Error deleting guide request:", err);
    throw err;
  }
};


module.exports = {
  saveGuideRequest,
  updateGuideResponse,
  getAllGuideResponses,
  getGuideRequestsByGuideId,
  deleteGuideRequestByBookingId,
};
