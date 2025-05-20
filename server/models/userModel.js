const pool = require("../db");

const createUser = async (userData) => {
  const {
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
  } = userData;

  // here Active needs to be changed to "Active" or "Inactive" based on
  const query = `
    INSERT INTO users 
    (first_name, last_name, email_address, password, nic_number, contact_number, addressline_01, addressline_02, role, profile_picture, tourist_license, status) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active') 
    RETURNING user_id, first_name, last_name, email_address, role`;

  const values = [
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
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateUserById = async (userId, userData) => {
  // Filter out undefined values and prepare the update fields
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  // List of allowed fields that can be updated
  const allowedFields = [
    "firstName",
    "lastName",
    "email",
    "password",
    "nic",
    "contactNumber",
    "address1",
    "address2",
    "role",
    "profilePicturePath",
    "touristLicensePath",
    "status",
  ];

  // Build the dynamic query parts
  for (const [key, value] of Object.entries(userData)) {
    if (allowedFields.includes(key) && value !== undefined) {
      // Map JavaScript camelCase to database snake_case
      const dbField =
        {
          firstName: "first_name",
          lastName: "last_name",
          email: "email_address",
          password: "password",
          nic: "nic_number",
          contactNumber: "contact_number",
          address1: "addressline_01",
          address2: "addressline_02",
          profilePicturePath: "profile_picture",
          touristLicensePath: "tourist_license",
        }[key] || key; // Default to original key if not in mapping

      updateFields.push(`${dbField} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (updateFields.length === 0) {
    throw new Error("No valid fields provided for update");
  }

  // Add the user ID as the last parameter
  values.push(userId);

  const query = `
    UPDATE users 
    SET ${updateFields.join(", ")}
    WHERE user_id = $${paramIndex}
    RETURNING 
      user_id, 
      first_name as "firstName", 
      last_name as "lastName", 
      email_address as "email", 
      role,
      status`;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new Error("User not found or no changes made");
  }

  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email_address = $1`;
  const values = [email];
  const result = await pool.query(query, values);
  return result.rows.length > 0 ? result.rows[0] : null;
};

const getAllUsers = async () => {
  const query = `SELECT * FROM users`;
  const result = await pool.query(query);
  return result.rows;
};

// get user by id
const getUserById = async (id) => {
  const query = `SELECT * FROM users WHERE user_id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// get guide by id
const getGuideById = async (id) => {
  const query = `SELECT * FROM users WHERE user_id = $1 AND role = 'Guide'`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAdmins = async () => {
  const query = `SELECT * FROM users WHERE role = $1`;
  const values = ["Admin"];
  const result = await pool.query(query, values);
  return result.rows;
};

const getAdminCount = async () => {
  const query = `SELECT COUNT(*) AS admin_count FROM users WHERE role = $1`;
  const values = ["Admin"];
  const result = await pool.query(query, values);
  return parseInt(result.rows[0].admin_count, 10); // Convert to a number
};

const getUserRoleById = async (id) => {
  const query = `SELECT role FROM users WHERE user_id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getGuides = async () => {
  const query = `SELECT * FROM users WHERE role = $1`;
  const values = ["Guide"];
  const result = await pool.query(query, values);
  return result.rows;
};

const getGuideCount = async () => {
  const query = `SELECT COUNT(*) AS guide_count FROM users WHERE role = $1`;
  const values = ["Guide"];
  const result = await pool.query(query, values);
  return parseInt(result.rows[0].guide_count, 10); // Convert to a number
};

const getActiveGuides = async () => {
  const query = `
    SELECT user_id, first_name, last_name, contact_number From users
    WHERE role = $1 AND status = $2`;
  const values = ["Guide", "Active"];
  const result = await pool.query(query, values);
  return result.rows;
};

const changeStatusById = async (
  id,
  status,
  leave_start_date,
  leave_end_date
) => {
  const query = `
    UPDATE users 
    SET status = $1, leave_due_date = $2, leave_end_date = $3 
    WHERE user_id = $4 AND role = 'Guide'
    RETURNING user_id, status, leave_due_date, leave_end_date
  `;
  const values = [status, leave_start_date, leave_end_date, id];
  const result = await pool.query(query, values);
  return result.rowCount > 0 ? result.rows[0] : null;
};

const deleteUserById = async (id) => {
  const query = `DELETE FROM users WHERE user_id = $1`;
  await pool.query(query, [id]);
};

module.exports = {
  createUser,
  findUserByEmail,
  getAllUsers,
  getAdmins,
  deleteUserById,
  getGuides,
  getActiveGuides,
  changeStatusById,
  getGuideById,
  getUserById,
  getAdminCount,
  getGuideCount,
  getUserRoleById,
  updateUserById,
};
