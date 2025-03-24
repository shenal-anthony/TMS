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


module.exports = { createAccommodation };
