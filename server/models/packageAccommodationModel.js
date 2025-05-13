const pool = require("../db");

const addPackageAccommodation = async ({ tourId, accommodationId }) => {
  try {
    const result = await pool.query(
      "INSERT INTO package_accommodations (tour_id, accommodation_id) VALUES ($1, $2) RETURNING *",
      [tourId, accommodationId]
    );

    return result.rows[0]; // return the created packageDestination
  } catch (error) {
    console.error("Error adding package accommodation:", error);
    throw error; // let the caller handle the response
  }
};

module.exports = {
  addPackageAccommodation,
};
