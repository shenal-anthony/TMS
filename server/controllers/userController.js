// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const registerUser = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) return res.status(400).json({ message: "User already exists" });

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = await User.create({ username, email, password: hashedPassword });

//     res.status(201).json({ message: "User registered successfully", user: newUser });
//   } catch (error) {
//     res.status(500).json({ message: "Error registering user", error });
//   }
// };

// module.exports = { registerUser };
