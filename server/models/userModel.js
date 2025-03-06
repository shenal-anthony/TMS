const pool = require('../db');

const createUser = async (name, email, hashedPassword) => {
  const query = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`;
  const values = [name, email, hashedPassword];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const getAllUsers = async () => {
  const query = `SELECT * FROM users`;
  const result = await pool.query(query);
  return result.rows;
};

// Get all admins from the users table
const getAdmins = async () => {
  const query = 'SELECT * FROM users WHERE role = $1';
  const values = ['Admin'];  // Role value for Admin
  const result = await pool.query(query, values);
  return result.rows;
};


module.exports = { createUser, findUserByEmail, getAllUsers, getAdmins };
