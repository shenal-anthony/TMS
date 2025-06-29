// events table
const pool = require("../db");

const getAllEvents = async () => {
  const query = `SELECT * FROM events`;
  const result = await pool.query(query);
  // console.log("🚀 ~ getAllEvents ~ result:", result)
  return result.rows;
};

const addEvent = async (eventData) => {
  const { startDate, groupSize, description } = eventData;

  const query = `INSERT INTO events (start_date,
  group_size, description) VALUES ($1, $2, $3) RETURNING *;`;

  const values = [
    startDate, // $1
    groupSize, // $2
    description, // $3
  ];
  const result = await pool.query(query, values);
  // console.log("🚀 ~ addEvent ~ result:", result)
  return result.rows[0];
};

const deleteEventById = async (id) => {
  const query = "DELETE FROM events WHERE event_id = $1";
  await pool.query(query, [id]);
};

module.exports = { getAllEvents, addEvent, deleteEventById };
