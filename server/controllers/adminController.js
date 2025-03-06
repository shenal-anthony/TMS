// server/controllers/adminController.js
const User = require('../models/userModel');

module.exports = {
  getAllAdmins: async (req, res) => {
    try {
      const admins = await User.getAdmins();  // Fetch admins from the model
      console.log(admins);
      res.json(admins);  // Send admins list as JSON response
    } catch (error) {
      res.status(500).json({ message: 'Error fetching admins', error: error.message });
    }
  }
};

