const pool = require("../db");

const addPackageAccommodation = async ({ tourId, accommodationId }) => {
  try {
    const result = await pool.query(
      "INSERT INTO tours_accommodations (tour_id, accommodation_id) VALUES ($1, $2) RETURNING *",
      [tourId, accommodationId]
    );

    return result.rows[0]; // return the created packageDestination
  } catch (error) {
    console.error("Error adding package accommodation:", error);
    throw error; // let the caller handle the response
  }
};

const getAccommodationsByTourId = async (tourId) => {
  const query = `
    SELECT 
      a.accommodation_id,
      a.accommodation_name,
      a.location_url,
      a.picture_url,
      a.amenities,
      a.accommodation_type
    FROM PUBLIC."accommodations" a
    JOIN PUBLIC."tours_accommodations" pa ON a.accommodation_id = pa.accommodation_id
    WHERE pa.tour_id = $1;
  `;
  const result = await pool.query(query, [tourId]);
  return result.rows;
};

// get tour details by accommodation id
const getTourDetailsByAccId = async (id) => {
  const query = `
    SELECT 
      t.tour_id,
      t.activity,
      t.picture_url,
      a.accommodation_name,
      a.accommodation_type
    FROM tours t
    JOIN tours_accommodations pa ON t.tour_id = pa.tour_id
    JOIN accommodations a ON pa.accommodation_id = a.accommodation_id
    WHERE a.accommodation_id = $1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  addPackageAccommodation,
  getAccommodationsByTourId,
  getTourDetailsByAccId,
};
