// bookings table
const pool = require("../db");

const getTourists = async () => {
  const query = `SELECT * FROM tourists`;
  const result = await pool.query(query);
  return result.rows;
};

const getTouristById = async (id) => {
  const query = `SELECT * FROM tourists WHERE tourist_id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const findTouristByEmail = async (email) => {
  const query = "SELECT * FROM tourists WHERE email_address = $1";
  const values = [email];
  const result = await pool.query(query, values);
  return result.rows.length > 0 ? result.rows[0] : null;
};

const findTouristByNIC = async (nic) => {
  const query = "SELECT * FROM tourists WHERE nic_number = $1";
  const values = [nic];
  const result = await pool.query(query, values);
  // console.log("🚀 ~ touristModel.js:22 ~ findTouristByNIC ~ result.rows:", result.rows);
  return result.rows.length > 0 ? result.rows : null;
};

const addTourist = async (touristData) => {
  try {
    const {
      firstName,
      lastName,
      email,
      contactNumber,
      nicNumber,
      country,
      city,
      postalCode,
      addressLine1,
      addressLine2,
    } = touristData;

    const query = `
      INSERT INTO tourists 
        (first_name, last_name, email_address, contact_number, nic_number, 
         country, city, postal_code, addressline_01, addressline_02) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *;
    `;

    // Process address fields to remove extra spaces and convert to lowercase
    const processAddress = (address) => {
      return address ? address.replace(/\s+/g, " ").trim().toLowerCase() : null;
    };

    const values = [
      firstName.toLowerCase(), // Convert to lowercase before storage
      lastName.toLowerCase(), // Convert to lowercase before storage
      email.toLowerCase(),
      contactNumber,
      nicNumber,
      country,
      city.toLowerCase(), // Convert to lowercase before storage
      postalCode,
      processAddress(addressLine1), // Process address to remove extra spaces
      addressLine2 ? processAddress(addressLine2) : null, // Convert to lowercase before storage
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding tourist:", error);
    throw error;
  }
};

const deleteTouristById = async (id) => {
  const query = "DELETE FROM tourists WHERE tourist_id = $1";
  await pool.query(query, [id]);
};

module.exports = {
  getTourists,
  findTouristByEmail,
  findTouristByNIC,
  addTourist,
  deleteTouristById,
  getTouristById,
};
