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
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(accommodationData)) {
    if (value !== undefined && value !== null) {
      let column;
      switch (key) {
        case "accommodationName":
          column = "accommodation_name";
          break;
        case "locationUrl":
          column = "location_url";
          break;
        case "pictureUrl":
          column = "picture_url";
          break;
        case "contactNumber":
          column = "contact_number";
          break;
        case "amenities":
          column = "amenities";
          break;
        case "updatedAt":
          column = "updated_at";
          break;
        case "serviceUrl":
          column = "service_url";
          break;
        case "accommodationType":
          column = "accommodation_type";
          break;
        default:
          continue; // skip unknown fields
      }
      fields.push(`${column} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (fields.length === 0) {
    throw new Error("No valid fields provided to update.");
  }

  const query = `
    UPDATE accommodations 
    SET ${fields.join(", ")} 
    WHERE accommodation_id = $${index} 
    RETURNING *`;

  values.push(id); // accommodation_id as last value

  const result = await pool.query(query, values);
  // console.log("🚀 ~ accommodationModel.js:103 ~ updateAccommodationById ~ result:", result);
  return result.rows[0];
};

module.exports = {
  createAccommodation,
  getAllAccommodations,
  deleteAccommodationById,
  updateAccommodationById,
};
