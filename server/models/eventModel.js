// events table
const pool = require("../db");

const getAllEvents = async () => {
  const query = `SELECT * FROM events`;
  const result = await pool.query(query);
  console.log("🚀 ~ getAllEvents ~ result:", result)
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
  console.log("🚀 ~ addEvent ~ result:", result)
  return result.rows[0];
};

const updateEventById = async (id, destinationData) => {
  const {
    locationUrl,
    pictureUrl,
    description,
    destinationName,
    weatherCondition,
  } = destinationData;

  const query = `UPDATE destinations SET location_url = $1, picture_url = $2, description = $3, destination_name = $4, weather_condition = $5 WHERE destination_id = $6 RETURNING *;`;
  const values = [
    locationUrl,
    pictureUrl,
    description,
    destinationName,
    weatherCondition,
    id,
  ];
  const result = await pool.query(query, values);
  // console.log(result.rows[0]); // debug
  // console.log("Received data:", destinationData); // debug
  return result.rows[0];
};

const deleteEventById = async (id) => {
  const query = "DELETE FROM events WHERE event_id = $1";
  await pool.query(query, [id]);
};

module.exports = { getAllEvents, addEvent, updateEventById, deleteEventById };
