// server/controllers/adminController.js
const user = require("../models/userModel");

const getAllAdmins = async (req, res) => {
  try {
    const admins = await user.getAdmins(); // Fetch admins
    res.json(admins); // Send admins list as JSON response
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await user.deleteAdminById(id);
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting admin", error: error.message });
  }
};

module.exports = { getAllAdmins, deleteAdmin };
