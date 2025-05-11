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
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(destinationData)) {
    if (value !== undefined && value !== null) {
      // Convert camelCase to snake_case to match DB column names
      let column;
      switch (key) {
        case "locationUrl":
          column = "location_url";
          break;
        case "pictureUrl":
          column = "picture_url";
          break;
        case "description":
          column = "description";
          break;
        case "destinationName":
          column = "destination_name";
          break;
        case "weatherCondition":
          column = "weather_condition";
          break;
        default:
          continue; // Skip unrecognized fields
      }

      fields.push(`${column} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }

  const query = `
    UPDATE destinations
    SET ${fields.join(", ")}
    WHERE destination_id = $${paramIndex}
    RETURNING *;
  `;

  values.push(id); // Add ID as the last parameter

  const result = await pool.query(query, values);
  // console.log("🚀 ~ destinationModel.js:89 ~ updateDestinationById ~ values:", values);
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
