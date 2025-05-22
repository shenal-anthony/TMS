const pool = require("../db");

const addPackageDestination = async ({ tourId, destinationId }) => {
  try {
    const result = await pool.query(
      "INSERT INTO tours_destinations (tour_id, destination_id) VALUES ($1, $2) RETURNING *",
      [tourId, destinationId]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error adding package destination:", error);
    throw error;
  }
};

// Delete all destinations for a tour
const deleteTourDestinations = async (tourId) => {
  try {
    const result = await pool.query(
      "DELETE FROM tours_destinations WHERE tour_id = $1 RETURNING *",
      [tourId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error deleting tour destinations:", error);
    throw error;
  }
};

// Add a single destination to a tour
const addTourDestination = async ({ tourId, destinationId }) => {
  try {
    const result = await pool.query(
      "INSERT INTO tours_destinations (tour_id, destination_id) VALUES ($1, $2) RETURNING *",
      [tourId, destinationId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error adding tour destination:", error);
    throw error;
  }
};

// Update tour destinations (delete existing and add new)
const updateTourDestinations = async (tourId, destinationIds) => {
  try {
    // Delete existing destinations
    await deleteTourDestinations(tourId);

    // Add new destinations
    const results = await Promise.all(
      destinationIds.map((destinationId) =>
        addTourDestination({ tourId, destinationId })
      )
    );
    return results;
  } catch (error) {
    console.error("Error updating tour destinations:", error);
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
    JOIN PUBLIC."tours_destinations" td ON d.destination_id = td.destination_id
    WHERE td.tour_id = $1;
  `;
  const result = await pool.query(query, [tourId]);
  return result.rows;
};

// Get destination IDs for a tour
const getTourDestinations = async (tourId) => {
  const query = `
    SELECT destination_id
    FROM tours_destinations
    WHERE tour_id = $1
  `;
  const result = await pool.query(query, [tourId]);
  return result.rows.map((row) => row.destination_id);
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
    JOIN tours_destinations td ON t.tour_id = td.tour_id
    JOIN destinations d ON td.destination_id = d.destination_id
    WHERE d.destination_id = $1;
  `;
  const result = await pool.query(query, [id]);
  // console.log("🚀 ~ packageDestinationModel.js:49 ~ getTourDetailsByDesId ~ result:", result);
  return result.rows[0];
};

const getToursByDestinationIds = async (destinationIds) => {
  if (!destinationIds.length) return [];
  const query = `
    SELECT 
      td.destination_id,
      t.tour_id,
      t.activity,
      t.picture_url
    FROM PUBLIC."tours_destinations" td
    JOIN PUBLIC."tours" t ON td.tour_id = t.tour_id
    WHERE td.destination_id = ANY($1);
  `;
  const result = await pool.query(query, [destinationIds]);
  return result.rows;
};

const getTourIdsByDestinationIds = async (destinationIds) => {
  if (!destinationIds.length) return [];
  const query = `
    SELECT DISTINCT tour_id
    FROM tours_destinations
    WHERE destination_id = ANY($1)
  `;
  const result = await pool.query(query, [destinationIds]);
  return result.rows.map((row) => row.tour_id);
};

module.exports = {
  addPackageDestination,
  getDestinationsByTourId,
  getTourDetailsByDesId,
  getToursByDestinationIds,
  getTourDestinations,
  getTourIdsByDestinationIds,
  addTourDestination,
  updateTourDestinations,
  deleteTourDestinations,
};
