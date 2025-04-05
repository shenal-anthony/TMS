// bookings table
const pool = require("../db");

const getTourists = async () => {
  const query = `SELECT * FROM tourists`;
  const result = await pool.query(query);
  return result.rows;
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
  return result.rows.length > 0 ? result.rows[0] : null;
};

const addTourist = async (touristData) => {
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

  const query = `INSERT INTO tourists (first_name, last_name, email_address, contact_number, nic_number, country, city, postal_code, addressline_01, addressline_02) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`;
  const values = [
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
  ];
  const result = await pool.query(query, values);
//   console.log("🚀 ~ touristModel.js:52 ~ addTourist ~ result:", result);
  return result.rows[0];
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
};
