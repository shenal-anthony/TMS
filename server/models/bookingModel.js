// bookings table
const pool = require("../db");

const getAllBookings = async () => {
  const query = `SELECT * FROM bookings`;
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
  console.log("🚀 ~ bookingModel.js:36 ~ addBooking ~ result:", result);
  return result.rows[0];
};

const updateDestinationById = async (id, destinationData) => {
  const {
    locationUrl,
    pictureUrl,
    description,
    destinationName,
    weatherCondition,
  } = destinationData;

  const query = `UPDATE destinations SET location_url = $1, picture_url = $2, description = $3, destination_name = $4, weather_condition = $5 WHERE destination_id = $6 RETURNING *;`;
  const values = [
    locationUrl,
    pictureUrl,
    description,
    destinationName,
    weatherCondition,
    id,
  ];
  const result = await pool.query(query, values);
  // console.log(result.rows[0]); // debug
  // console.log("Received data:", destinationData); // debug
  return result.rows[0];
};

const deleteBookingById = async (id) => {
  const query = "DELETE FROM bookings WHERE booking_id = $1";
  await pool.query(query, [id]);
};

module.exports = {
  getAllBookings,
  addBooking,
  deleteBookingById,
};
