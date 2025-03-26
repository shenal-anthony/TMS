const pool = require("../db");
// accommodations table

const createAccommodation = async (accommodationData) => {
  const {
    accommodationName,
    locationUrl,
    pictureUrl,
    contactNumber,
    amenities,
    updatedAt,
    serviceUrl,
    accommodationType,
  } = accommodationData;

  const query = `
      INSERT INTO accommodations 
      (accommodation_name, location_url, picture_url, contact_number, amenities, updated_at, service_url, accommodation_type) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`;

  const values = [
    accommodationName,
    locationUrl,
    pictureUrl,
    contactNumber,
    amenities,
    updatedAt,
    serviceUrl,
    accommodationType,
  ];

  const result = await pool.query(query, values);
  // console.log(result.rows[0]); // Debugging
  return result.rows[0];
};

const getAllAccommodations = async () => {
  const query = `SELECT * FROM accommodations`;
  const result = await pool.query(query);
  return result.rows;
};

const deleteAccommodationById = async (id) => {
  const query = "DELETE FROM accommodations WHERE accommodation_id = $1";
  await pool.query(query, [id]);
};

const updateAccommodationById = async (id, accommodationData) => {
  const {
    accommodationName,
    locationUrl,
    pictureUrl,
    contactNumber,
    amenities,
    updatedAt,
    serviceUrl,
    accommodationType,
  } = accommodationData;

  const query = `
      UPDATE accommodations SET 
      accommodation_name = $1, 
      location_url = $2, 
      picture_url = $3, 
      contact_number = $4, 
      amenities = $5, 
      updated_at = $6, 
      service_url = $7, 
      accommodation_type = $8 
      WHERE accommodation_id = $9
      RETURNING *`;

  const values = [
    accommodationName,
    locationUrl,
    pictureUrl,
    contactNumber,
    amenities,
    updatedAt,
    serviceUrl,
    accommodationType,
    id,
  ];

  const result = await pool.query(query, values);
  console.log("update model:", result.rows[0]); // Debugging
  return result.rows[0];
};

module.exports = {
  createAccommodation,
  getAllAccommodations,
  deleteAccommodationById,
  updateAccommodationById,
};
