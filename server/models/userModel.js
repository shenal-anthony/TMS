const pool = require("../db");

const createUser = async (userData) => {
  const {
    firstName,
    lastName,
    email,
    hashedPassword,
    nic,
    contactNumber,
    address1,
    address2,
    role,
    profilePicturePath,
    touristLicensePath,
  } = userData;

  // here Active needs to be changed to "Active" or "Inactive" based on
  const query = `
    INSERT INTO users 
    (first_name, last_name, email_address, password, nic_number, contact_number, addressline_01, addressline_02, role, profile_picture, tourist_license, status) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active') 
    RETURNING user_id, first_name, last_name, email_address, role`;

  const values = [
    firstName,
    lastName,
    email,
    hashedPassword,
    nic,
    contactNumber,
    address1,
    address2,
    role,
    profilePicturePath,
    touristLicensePath,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email_address = $1`;
  const values = [email];
  const result = await pool.query(query, values);
  return result.rows.length > 0 ? result.rows[0] : null;
};

const getAllUsers = async () => {
  const query = `SELECT * FROM users`;
  const result = await pool.query(query);
  return result.rows;
};

const getAdmins = async () => {
  const query = `SELECT * FROM users WHERE role = $1`;
  const values = ["Admin"];
  const result = await pool.query(query, values);
  return result.rows;
};

const getGuides = async () => {
  const query = `SELECT * FROM users WHERE role = $1`;
  const values = ["Guide"];
  const result = await pool.query(query, values);
  return result.rows;
};

const getActiveGuides = async () => {
  const query = `
    SELECT user_id, first_name, last_name, contact_number From users
    WHERE role = $1 AND status = $2`;
  const values = ["Guide", "Active"];
  const result = await pool.query(query, values);
  return result.rows;
};

const changeStatusById = async (id, status) => {
  const query = `UPDATE users SET status = $1 WHERE user_id = $2 AND role = 'Guide'`;
  const values = [status, id];
  const result = await pool.query(query, values);
  // console.log("🚀 ~ userModel.js:83 ~ changeStatusById ~ result:", result);
  return result.rowCount > 0; // returns true if a row was updated
};

const deleteUserById = async (id) => {
  const query = `DELETE FROM users WHERE user_id = $1`;
  await pool.query(query, [id]);
};

module.exports = {
  createUser,
  findUserByEmail,
  getAllUsers,
  getAdmins,
  deleteUserById,
  getGuides,
  getActiveGuides,
  changeStatusById,
};
