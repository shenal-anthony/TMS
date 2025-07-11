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

// Delete all accommodations for a tour
const deleteTourAccommodations = async (tourId) => {
  try {
    const result = await pool.query(
      "DELETE FROM tours_accommodations WHERE tour_id = $1 RETURNING *",
      [tourId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error deleting tour accommodations:", error);
    throw error;
  }
};

// Add a single accommodation to a tour
const addTourAccommodation = async ({ tourId, accommodationId }) => {
  try {
    const result = await pool.query(
      "INSERT INTO tours_accommodations (tour_id, accommodation_id) VALUES ($1, $2) RETURNING *",
      [tourId, accommodationId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error adding tour accommodation:", error);
    throw error;
  }
};

// Update tour accommodations (delete existing and add new)
const updateTourAccommodations = async (tourId, accommodationIds) => {
  try {
    // Delete existing accommodations
    await deleteTourAccommodations(tourId);

    // Add new accommodations
    const results = await Promise.all(
      accommodationIds.map((accommodationId) =>
        addTourAccommodation({ tourId, accommodationId })
      )
    );
    return results;
  } catch (error) {
    console.error("Error updating tour accommodations:", error);
    throw error;
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

// Get accommodation IDs for a tour
const getTourAccommodations = async (tourId) => {
  const query = `
    SELECT accommodation_id
    FROM tours_accommodations
    WHERE tour_id = $1
  `;
  const result = await pool.query(query, [tourId]);
  return result.rows.map((row) => row.accommodation_id);
};

const getToursByAccommodationIds = async (accommodationIds) => {
  if (!accommodationIds.length) return [];
  const query = `
    SELECT 
      ta.accommodation_id,
      t.tour_id,
      t.activity,
      t.picture_url
    FROM PUBLIC."tours_accommodations" ta
    JOIN PUBLIC."tours" t ON ta.tour_id = t.tour_id
    WHERE ta.accommodation_id = ANY($1);
  `;
  const result = await pool.query(query, [accommodationIds]);
  return result.rows;
};

const getTourIdsByAccommodationIds = async (accommodationIds) => {
  if (!accommodationIds.length) return [];
  const query = `
    SELECT DISTINCT tour_id
    FROM tours_accommodations
    WHERE accommodation_id = ANY($1)
  `;
  const result = await pool.query(query, [accommodationIds]);
  return result.rows.map((row) => row.tour_id);
};

module.exports = {
  addPackageAccommodation,
  getAccommodationsByTourId,
  getTourDetailsByAccId,
  getToursByAccommodationIds,
  getTourAccommodations,
  getTourIdsByAccommodationIds,
  updateTourAccommodations,
  addTourAccommodation,
  deleteTourAccommodations,
};
