const db = require("../db"); // Import database connection

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from token

    // Fetch user's name from the users table
    const [user] = await db.query("SELECT name FROM users WHERE id = ?", [userId]);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ name: user[0].name }); // Send the user's name as a response
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data" });
  }
};

module.exports = { getDashboardData };
