const pool = require("../db");
const bcrypt = require("../node_modules/bcryptjs");
const generateToken = require("../utils/jwtGenerator");

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    // Compare passwords
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //     return res.status(401).json({ message: "Invalid email or password" });
    // }
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(200).json({ token, userId: user.id, email: user.email });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { loginUser };
