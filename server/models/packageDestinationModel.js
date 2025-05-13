const pool = require("../db");

const addPackageDestination = async ({ tourId, destinationId }) => {
  try {
    const result = await pool.query(
      "INSERT INTO package_destinations (tour_id, destination_id) VALUES ($1, $2) RETURNING *",
      [tourId, destinationId]
    );

    return result.rows[0]; // return the created packageDestination
  } catch (error) {
    console.error("Error adding package destination:", error);
    throw error; // let the caller handle the response
  }
};

module.exports = {
  addPackageDestination,
};
