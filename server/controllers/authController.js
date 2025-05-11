const pool = require("../db");
const bcrypt = require("../node_modules/bcryptjs");
const generateToken = require("../utils/tokenGenerator");
const userModel = require("../models/userModel");

const fs = require("fs");
const path = require("path");

const getAllRegisteredUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const users = result.rows.map((user) => {
      // Normalize profile picture path
      const profilePicture = user.profile_picture
        ? `${baseUrl}${user.profile_picture.replace(/\\/g, "/")}`
        : null;

      // Split comma-separated string and normalize each license path
      const touristLicenses = user.tourist_license
        ? user.tourist_license
            .split(",")
            .map((path) => `${baseUrl}${path.trim().replace(/\\/g, "/")}`)
        : [];

      return {
        ...user,
        profilePicture,
        touristLicenses,
      };
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const registerUser = async (req, res) => {
  try {
    let {
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

    const errors = {};

    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";
    if (!contactNumber) errors.contactNumber = "Contact number is required";
    if (!email) errors.email = "Email is required";
    if (!nic) errors.nic = "NIC is required";
    if (!address1) errors.address1 = "Address line 1 is required";
    if (!password) errors.password = "Password is required";
    if (!confirmPassword)
      errors.confirmPassword = "Confirm password is required";
    if (!role) errors.role = "Role is required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    firstName = firstName.trim().toLowerCase();
    lastName = lastName.trim().toLowerCase();
    email = email.trim().toLowerCase();
    address1 = address1.trim().toLowerCase();
    address2 = address2 ? address2.trim().toLowerCase() : "";

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const fileFields = req.files || {};
    const profileImage = fileFields["profilePicture"]?.[0] || null;
    const licenseFiles = fileFields["touristLicense"] || [];

    const profileImageUrl = profileImage
      ? path.join("/uploads/profile_pics", profileImage.filename)
      : null;
    const licenseUrls =
      role === "Guide"
        ? licenseFiles.map((file) =>
            path.join("/uploads/tourist_licenses", file.filename)
          )
        : [];

    const newUser = await userModel.createUser({
      firstName,
      lastName,
      contactNumber,
      email,
      nic,
      address1,
      address2,
      hashedPassword,
      role,
      profilePicturePath: profileImageUrl,
      touristLicensePath: licenseUrls.join(","),
    });

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
    const user = await userModel.findUserByEmail(email);
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
    const userId = req.params.userId;
    let {
      firstName,
      lastName,
      contactNumber,
      email,
      nic,
      address1,
      address2,
      currentPassword,
      newPassword,
      confirmNewPassword,
    } = req.body;

    const errors = {};

    // Basic validation
    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";
    if (!contactNumber) errors.contactNumber = "Contact number is required";
    if (!email) errors.email = "Email is required";
    if (!nic) errors.nic = "NIC is required";
    if (!address1) errors.address1 = "Address line 1 is required";

    // Password change validation (optional)
    if (newPassword || confirmNewPassword) {
      if (!currentPassword) {
        errors.currentPassword = "Current password is required to change password";
      }
      if (newPassword !== confirmNewPassword) {
        errors.confirmNewPassword = "New passwords do not match";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Trim and lowercase fields
    firstName = firstName.trim().toLowerCase();
    lastName = lastName.trim().toLowerCase();
    email = email.trim().toLowerCase();
    address1 = address1.trim().toLowerCase();
    address2 = address2 ? address2.trim().toLowerCase() : "";

    // Get existing user
    const existingUser = await userModel.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Handle password change if requested
    let hashedPassword = existingUser.password;
    if (newPassword && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    }

    // Handle file uploads
    const fileFields = req.files || {};
    const profileImage = fileFields["profilePicture"]?.[0] || null;
    const licenseFiles = fileFields["touristLicense"] || [];

    // Get existing file paths or use new ones
    const profileImageUrl = profileImage
      ? path.join("/uploads/profile_pics", profileImage.filename)
      : existingUser.profilePicturePath;

    const licenseUrls = licenseFiles.length > 0
      ? licenseFiles.map(file => path.join("/uploads/tourist_licenses", file.filename))
      : existingUser.touristLicensePath?.split(",") || [];

    // Update user
    const updatedUser = await userModel.updateUserById(userId, {
      firstName,
      lastName,
      contactNumber,
      email,
      nic,
      address1,
      address2,
      password: hashedPassword,
      profilePicturePath: profileImageUrl,
      touristLicensePath: licenseUrls.join(","),
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update failed:", error);
    res.status(500).json({ error: "Profile update failed" });
  }
};

const getUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Normalize file paths
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const profilePicture = user.profile_picture
      ? `${baseUrl}${user.profile_picture.replace(/\\/g, "/")}`
      : null;
    const touristLicenses = user.tourist_license
      ? user.tourist_license.split(",").map((path) => `${baseUrl}${path.trim().replace(/\\/g, "/")}`)
      : [];

    res.status(200).json({
      ...user,
      profilePicture,
      touristLicenses,
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

module.exports = {
  loginUser,
  registerUser,
  editProfile,
  getAccessToken,
  getAllRegisteredUsers,
  getUser,
};
