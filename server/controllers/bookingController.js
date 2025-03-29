const booking = require("../models/bookingModel");

// get all
const getAllBookings = async (req, res) => {
  try {
    const contents = await booking.getAllBookings();
    res.json(contents);
    console.log(
      "🚀 ~ bookingController.js:15 ~ getAllBookings ~ contents:", contents
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching events", error: error.message });
  }
};
// add
const addBooking = async (req, res) => {
  const { body } = req;
  try {
    const newContent = await booking.addBooking(body);
    res.json(newContent);
    console.log(
      "🚀 ~ bookingController.js:30 ~ addEvent ~ newContent:",
      newContent
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding booking", error: error.message });
  }
};
// update

// delete
const deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    await booking.deleteBookingById(id);
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting booking", error: error.message });
  }
};

module.exports = { getAllBookings, addBooking, deleteBooking };
