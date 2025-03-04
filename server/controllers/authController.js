const pool = require("../db");
const bcrypt = require("../node_modules/bcryptjs");
const generateToken = require("../utils/jwtGenerator");

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      nic,
      contactNumber,
      address1,
      address2,
      role,
    } = req.body;
    const profilePicture = req.files?.profilePicture; // Assuming file upload via FormData
    const touristLicense = req.files?.touristLicense; // Assuming file upload via FormData

    // Check if user already exists
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save profile picture and tourist license file paths (if uploaded)
    let profilePicturePath = null;
    let touristLicensePath = null;

    if (profilePicture) {
      profilePicturePath = `/uploads/${Date.now()}_${profilePicture.name}`;
      await profilePicture.mv(`./public${profilePicturePath}`); // Move file to `public/uploads`
    }

    if (touristLicense) {
      touristLicensePath = `/uploads/${Date.now()}_${touristLicense.name}`;
      await touristLicense.mv(`./public${touristLicensePath}`);
    }

    // Insert new user into database
    const insertUserQuery = `
      INSERT INTO users 
      (first_name, last_name, email, password, nic, contact_number, address1, address2, role, profile_picture, tourist_license) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING id, first_name, last_name, email, role`;

    const newUser = await pool.query(insertUserQuery, [
      firstName,
      lastName,
      email,
      hashedPassword,
      nic,
      contactNumber,
      address1,
      address2,
      role,
      profilePicturePath,
      touristLicensePath,
    ]);

    // Generate JWT token
    const token = generateToken(newUser.rows[0].id);

    res.status(201).json({
      token,
      userId: newUser.rows[0].id,
      firstName: newUser.rows[0].first_name,
      lastName: newUser.rows[0].last_name,
      email: newUser.rows[0].email,
      role: newUser.rows[0].role,
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
