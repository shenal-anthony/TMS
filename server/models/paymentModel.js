// packages table
const pool = require("../db");

const getAllPayments = async () => {
  const query = `SELECT * FROM payments`;
  const result = await pool.query(query);
  return result.rows;
};

const getPaymentById = async (id) => {
  const query = `SELECT * FROM payments WHERE payment_id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  // console.log("🚀 ~ packageModel.js:14 ~ getPackageById ~ result:", result);
  return result.rows[0];
};

const getPaymentsByBookingId = async (id) => {
  const query = `SELECT * FROM payments WHERE booking_id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  // console.log("🚀 ~ paymentModel.js:22 ~ getPaymentByBookingId ~ result:", result);
  return result.rows[0];
};

const addPayment = async (paymentData) => {
  const { amount, paymentDate, status, bookingId } = paymentData;
  const query = `INSERT INTO payments (amount, payment_date, status, booking_id) VALUES ($1, $2, $3, $4) RETURNING *;`;
  const values = [amount, paymentDate, status, bookingId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updatePaymentById = async (id, paymentData) => {
  const { packageName, description, price, duration } = paymentData;

  const query = `UPDATE packages SET package_name = $1, description = $2, price = $3, duration = $4 WHERE package_id = $5 RETURNING *;`;
  const values = [packageName, description, price, duration, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deletePaymentById = async (id) => {
  const query = "DELETE FROM payments WHERE payment_id = $1";
  await pool.query(query, [id]);
};

module.exports = {
  getAllPayments,
  getPaymentById,
  addPayment,
  updatePaymentById,
  deletePaymentById,
  getPaymentsByBookingId,
};
