// server/controllers/adminController.js
const user = require("../models/userModel");

const getAllAdmins = async (req, res) => {
  try {
    const admins = await user.getAdmins();
    res.json(admins);
    // console.log("🚀 ~ adminController.js:13 ~ getAllAdmins ~ admins:", admins);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

// get admin by id
const getAdminById = async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await user.getUserById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admin", error: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await user.deleteUserById(id);
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting admin", error: error.message });
  }
};



module.exports = { getAllAdmins, deleteAdmin, getAdminById };
