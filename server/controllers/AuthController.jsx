const AdminModel = require('../models/AdminModel');

const adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.error('Username or password missing');
    return res.status(400).json({ message: 'Username and password are required' });
  }

  console.log('Login request received:', username, password);

  AdminModel.getAdminByUsername(username, (err, admin) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log('Database response:', admin);

    if (!admin) {
      console.log('Invalid username');
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (password !== admin.password) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    console.log('Login successful');
    res.status(200).json({ message: 'Login successful' });
  });
};

module.exports = { adminLogin };