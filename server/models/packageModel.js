// packages table
const pool = require("../db");

const getAllPackages = async () => {
  const query = `SELECT * FROM packages`;
  const result = await pool.query(query);
  return result.rows;
};

const getPackageById = async (id) => {
  const query = `SELECT * FROM packages WHERE package_id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  // console.log("🚀 ~ packageModel.js:14 ~ getPackageById ~ result:", result);
  return result.rows[0];
};

const addPackage = async (packageData) => {
  const { packageName, description, price, duration } = packageData;

  const query = `INSERT INTO packages (package_name,
  description, price, duration) VALUES ($1, $2, $3, $4) RETURNING *;`;
  const values = [
    packageName, // $1
    description, // $2
    price, // $3
    duration, // $4
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updatePackageById = async (id, packageData) => {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(packageData)) {
    if (value !== undefined && value !== null) {
      // Convert camelCase to snake_case to match DB column names
      let column;
      switch (key) {
        case "packageName":
          column = "package_name";
          break;
        case "description":
          column = "description";
          break;
        case "price":
          column = "price";
          break;
        case "duration":
          column = "duration";
          break;
        default:
          continue; // Skip unrecognized fields
      }

      fields.push(`${column} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }

  const query = `
    UPDATE packages
    SET ${fields.join(", ")}
    WHERE package_id = $${paramIndex}
    RETURNING *;
  `;

  values.push(id); // Add ID as the last parameter

  const result = await pool.query(query, values);
  // console.log("🚀 ~ packageModel.js:94 ~ updatePackageById ~ values:", values);
  return result.rows[0];
};

const deletePackageById = async (id) => {
  const query = "DELETE FROM packages WHERE package_id = $1";
  await pool.query(query, [id]);
};

// Get package details by package IDs
async function getPackagesByIds(packageIds) {
  if (!packageIds.length) return [];
  const query = `
    SELECT package_id, package_name, description, price, duration
    FROM packages
    WHERE package_id = ANY($1)
  `;
  const result = await pool.query(query, [packageIds]);
  return result.rows;
}

module.exports = {
  getAllPackages,
  addPackage,
  updatePackageById,
  deletePackageById,
  getPackageById,
  getPackagesByIds,
};
