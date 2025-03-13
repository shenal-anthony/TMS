const pool = require("../db");
const bcrypt = require("../node_modules/bcryptjs");
const generateToken = require("../utils/jwtGenerator");
const { findUserByEmail, createUser } = require("../models/userModel");

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
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
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
      await profilePicture.mv(`./public${profilePicturePath}`);
    }

    if (touristLicense) {
      touristLicensePath = `/uploads/${Date.now()}_${touristLicense.name}`;
      await touristLicense.mv(`./public${touristLicensePath}`);
    }

    // Create user in the database
    const newUser = await createUser({
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
    });

    // Generate JWT token
    const token = generateToken(newUser.user_id);

    res.status(201).json({
      token,
      userId: newUser.user_id,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      email: newUser.email_address,
      role: newUser.role,
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
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Generate JWT token
    const token = generateToken(user.user_id);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const fs = require("fs");
const path = require("path");

const editProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, contactNumber, address1, address2 } =
      req.body;

    // Check if the user exists
    const userQuery = "SELECT * FROM users WHERE id = $1";
    const userResult = await pool.query(userQuery, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let profilePicturePath = userResult.rows[0].profile_picture;

    // Check if a new profile picture is uploaded
    if (req.files?.profilePicture) {
      const profilePicture = req.files.profilePicture;

      // Delete old profile picture if exists
      if (profilePicturePath) {
        const oldFilePath = path.join(__dirname, "..", profilePicturePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Save new profile picture
      profilePicturePath = `/uploads/${Date.now()}_${profilePicture.name}`;
      profilePicture.mv(path.join(__dirname, "..", profilePicturePath));
    }

    // Update user details in the database
    const updateUserQuery = `
      UPDATE users 
      SET first_name = $1, last_name = $2, email = $3, contact_number = $4, 
          address1 = $5, address2 = $6, profile_picture = $7
      WHERE id = $8
      RETURNING id, first_name, last_name, email, contact_number, address1, address2, profile_picture;
    `;

    const updatedUser = await pool.query(updateUserQuery, [
      firstName,
      lastName,
      email,
      contactNumber,
      address1,
      address2,
      profilePicturePath,
      id,
    ]);

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error("Edit Profile error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { loginUser, registerUser, editProfile };
