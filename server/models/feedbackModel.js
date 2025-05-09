const pool = require("../db");

// tourist_id, rating, feedback_text, date_submitted

const createFeedback = async (feedbackData) => {
  const { touristId, rating, feedbackText, dateSubmitted } = feedbackData;

  const query = `
    INSERT INTO feedbacks (tourist_id, rating, feedback_text, date_submitted) 
    VALUES ($1, $2, $3, $4) 
    RETURNING tourist_id, rating, feedback_text, date_submitted
  `;

  const values = [touristId, rating, feedbackText, dateSubmitted];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getFeedbackByTouristId = async (touristId) => {
  const query = `
    SELECT * FROM feedbacks WHERE tourist_id = $1
  `;

  const values = [touristId];
  const result = await pool.query(query, values);
  return result.rows;
};

const getAllFeedbacks = async () => {
  const query = `
    SELECT * FROM feedbacks
  `;
  const result = await pool.query(query);
  return result.rows;
};



module.exports = {
  createFeedback,
  getFeedbackByTouristId,
  getAllFeedbacks,
};
