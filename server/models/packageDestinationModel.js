const pool = require("../db");

const addPackageDestination = async ({ tourId, destinationId }) => {
  try {
    const result = await pool.query(
      "INSERT INTO package_destinations (tour_id, destination_id) VALUES ($1, $2) RETURNING *",
      [tourId, destinationId]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error adding package destination:", error);
    throw error;
  }
};

const getDestinationsByTourId = async (tourId) => {
  const query = `
    SELECT 
      d.destination_id,
      d.destination_name,
      d.description,
      d.picture_url,
      d.location_url
    FROM PUBLIC."destinations" d
    JOIN PUBLIC."package_destinations" pd ON d.destination_id = pd.destination_id
    WHERE pd.tour_id = $1;
  `;
  const result = await pool.query(query, [tourId]);
  return result.rows;
};

// get tour details by destination id
const getTourDetailsByDesId = async (id) => {
  const query = `
    SELECT 
      t.tour_id,
      t.activity,
      t.picture_url,
      d.destination_name,
      d.picture_url AS destination_picture_url
    FROM tours t
    JOIN package_destinations pd ON t.tour_id = pd.tour_id
    JOIN destinations d ON pd.destination_id = d.destination_id
    WHERE d.destination_id = $1;
  `;
  const result = await pool.query(query, [id]);
  // console.log("🚀 ~ packageDestinationModel.js:49 ~ getTourDetailsByDesId ~ result:", result);
  return result.rows[0];
};

module.exports = {
  addPackageDestination,
  getDestinationsByTourId,
  getTourDetailsByDesId,
};
