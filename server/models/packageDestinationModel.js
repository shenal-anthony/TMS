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

module.exports = {
  addPackageDestination,
};
