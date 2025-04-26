// destinations table
const pool = require("../db");

const getAllDestinations = async () => {
  const query = `SELECT * FROM destinations`;
  const result = await pool.query(query);
  return result.rows;
};

const getDestinationById = async (id) => {
  const query = `SELECT * FROM destinations WHERE destination_id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  // console.log("🚀 ~ destinationModel.js:14 ~ getDestinationById ~ result:", result);  
  return result.rows[0];
};

const addDestination = async (destinationData) => {
  const {
    destinationName,
    description,
    weatherCondition,
    locationUrl,
    pictureUrl,
  } = destinationData;

  const query = `INSERT INTO destinations (location_url,
  picture_url, description, destination_name, weather_condition) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
  const values = [
    locationUrl, // $1
    pictureUrl, // $2
    description, // $3
    destinationName, // $4
    weatherCondition, // $5
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateDestinationById = async (id, destinationData) => {
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

const deleteDestinationById = async (id) => {
  const query = "DELETE FROM destinations WHERE destination_id = $1";
  await pool.query(query, [id]);
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  addDestination,
  updateDestinationById,
  deleteDestinationById,
};
