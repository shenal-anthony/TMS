const pool = require("../db");
const bcrypt = require("../node_modules/bcryptjs");
const generateToken = require("../utils/tokenGenerator");
const userModel = require("../models/userModel");

const fs = require("fs");
const path = require("path");
const baseUrl = process.env.BASE_URL;

// Register User Function
// const registerUser = async (req, res) => {
//   try {
//     const { body, files } = req;

//     // Check if all required fields are present
//     const requiredFields = [
//       "firstName",
//       "lastName",
//       "email",
//       "password",
//       "nic",
//       "contactNumber",
//       "address1",
//       "role",
//     ];

//     for (const field of requiredFields) {
//       if (!body[field]) {
//         return res.status(400).json({ message: `${field} is required` });
//       }
//     }

//     // Check if user already exists
//     const existingUser = await findUserByEmail(body.email);
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Hash the password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(body.password, saltRounds);

//     // Determine file paths if files are uploaded
//     const profilePicturePath = files?.profilePicture
//       ? `/uploads/profiles/${files.profilePicture[0].filename}`
//       : null;

//     const touristLicensePath = files?.touristLicense
//       ? `/uploads/licenses/${files.touristLicense[0].filename}`
//       : null;

//     // Prepare user data to be saved
//     const userData = {
//       firstName: body.firstName,
//       lastName: body.lastName,
//       email: body.email,
//       hashedPassword,
//       nic: body.nic,
//       contactNumber: body.contactNumber,
//       address1: body.address1,
//       address2: body.address2,
//       role: body.role,
//       profilePicturePath,
//       touristLicensePath,
//     };

//     // Create new user
//     const newUser = await createUser(userData);

//     // Generate JWT tokens
//     const { accessToken, refreshToken } = generateToken(newUser.user_id, newUser.role);

//     // Send success response
//     return res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       data: {
//         userId: newUser.user_id,
//         firstName: newUser.first_name,
//         lastName: newUser.last_name,
//         email: newUser.email_address,
//         role: newUser.role,
//         profilePicturePath,
//         touristLicensePath,
//         accessToken,
//         refreshToken,
//       },
//     });
//   } catch (error) {
//     console.error("Error registering user:", error.message);
//     res.status(500).json({
//       success: false,
//       error: "Internal server error",
//     });
//   }
// };

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      contactNumber,
      email,
      nic,
      address1,
      address2,
      password,
      confirmPassword,
      role,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const fileFields = req.files || {};
    const profileImage = fileFields["profilePicture"]?.[0] || null;
    const licenseFiles = fileFields["touristLicense"] || [];

    const profileImageUrl = profileImage
      ? path.join("/uploads/profile", profileImage.filename)
      : null;

    const licenseUrls =
      role === "guide"
        ? licenseFiles.map((file) =>
            path.join("/uploads/licenses", file.filename)
          )
        : [];

    // Create user
    const newUser = await userModel.createUser({
      firstName,
      lastName,
      contactNumber,
      email,
      nic,
      address1,
      address2: null,
      hashedPassword: password,
      role,
      profilePicturePath: profileImageUrl,
      touristLicensePath: licenseUrls.join(","),
    });
    console.log(
      "🚀 ~ authController.js:145 ~ registerUser ~ newUser:",
      newUser
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ error: "Registration failed" });
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
    const { accessToken, refreshToken } = generateToken(
      user.user_id,
      user.role
    );

    res.status(200).json({ accessToken, refreshToken, role: user.role });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

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

module.exports = { loginUser, registerUser, editProfile, getAccessToken };
