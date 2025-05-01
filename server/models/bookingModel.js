// bookings table
const pool = require("../db");

const getAllBookings = async () => {
  const query = `SELECT * FROM bookings`;
  const result = await pool.query(query);
  return result.rows;
};

const getPendingBookings = async () => {
  const query = `SELECT booking_id, booking_date, headcount, check_in_date,tourist_id, tour_id, user_id, event_id FROM bookings WHERE status = 'pending'`;
  const result = await pool.query(query);
  return result.rows;
};

const getConfirmedBookings = async () => {
  const query = `SELECT booking_id, booking_date, headcount, check_in_date, tourist_id, tour_id, user_id, event_id FROM bookings WHERE status = 'confirmed'`;
  const result = await pool.query(query);
  return result.rows;
};

const addBooking = async (bookingData) => {
  const {
    bookingDate,
    headcount,
    checkInDate,
    checkOutDate,
    status,
    touristId,
    tourId,
    userId,
    eventId,
  } = bookingData;

  const query = `INSERT INTO bookings (booking_date, headcount, check_in_date, check_out_date, status, tourist_id, tour_id, user_id, event_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`;
  const values = [
    bookingDate, // $1
    headcount, // $2
    checkInDate, // $3
    checkOutDate, // $4
    status, // $5
    touristId, // $6
    tourId, // $7
    userId, // $8
    eventId, // $9
  ];
  const result = await pool.query(query, values);
  // // // console.log("🚀 ~ bookingModel.js:36 ~ addBooking ~ result:", result);
  return result.rows[0];
};

const getBookingById = async (id) => {
  const query = `SELECT * FROM bookings WHERE booking_id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error(`Booking with ID ${id} not found`);
  }
  return result.rows[0];
};

const updateBookingById = async (bookingId, updates) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (updates.booking_date !== undefined) {
    fields.push(`booking_date = $${index++}`);
    values.push(updates.booking_date);
  }

  if (updates.headcount !== undefined) {
    fields.push(`headcount = $${index++}`);
    values.push(updates.headcount);
  }

  if (updates.check_in_date !== undefined) {
    fields.push(`check_in_date = $${index++}`);
    values.push(updates.check_in_date);
  }

  if (updates.check_out_date !== undefined) {
    fields.push(`check_out_date = $${index++}`);
    values.push(updates.check_out_date);
  }

  if (updates.status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(updates.status);
  }

  if (updates.tourist_id !== undefined) {
    fields.push(`tourist_id = $${index++}`);
    values.push(updates.tourist_id);
  }

  if (updates.tour_id !== undefined) {
    fields.push(`tour_id = $${index++}`);
    values.push(updates.tour_id);
  }

  if (updates.user_id !== undefined) {
    fields.push(`user_id = $${index++}`);
    values.push(updates.user_id);
  }

  if (updates.event_id !== undefined) {
    fields.push(`event_id = $${index++}`);
    values.push(updates.event_id);
  }

  if (fields.length === 0) {
    throw new Error("No valid fields provided for update.");
  }

  const query = `
    UPDATE bookings
    SET ${fields.join(", ")}
    WHERE booking_id = $${index}
    RETURNING *;
  `;

  values.push(bookingId);

  const result = await pool.query(query, values);
  // console.log("🚀 ~ bookingModel.js:120 ~ updateBookingById ~ result:", result);
  return result.rows[0];
};

const deleteBookingById = async (id) => {
  const query = "DELETE FROM bookings WHERE booking_id = $1";
  await pool.query(query, [id]);
};

module.exports = {
  getAllBookings,
  addBooking,
  getBookingById,
  updateBookingById,
  deleteBookingById,
  getPendingBookings,
  getConfirmedBookings,
};
