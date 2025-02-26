const pool = require("../db");
const bcrypt = require("../node_modules/bcryptjs");
const generateToken = require("../utils/jwtGenerator");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user into database
    const insertUserQuery =
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email";
    const newUser = await pool.query(insertUserQuery, [
      name,
      email,
      hashedPassword,
    ]);

    // Generate JWT token
    const token = generateToken(newUser.rows[0].id);

    res.status(201).json({
      token,
      userId: newUser.rows[0].id,
      name: newUser.rows[0].name,
      email: newUser.rows[0].email,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // for testing purposes
    // if (password !== user.password) {
    //   return res.status(401).json({ message: "Invalid email or password" });
    // }

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(200).json({
      token,
      userId: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { loginUser, registerUser };
