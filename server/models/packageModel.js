// packages table
const pool = require("../db");

const getAllPackages = async () => {
  const query = `SELECT * FROM packages`;
  const result = await pool.query(query);
  return result.rows;
};

const addPackage = async (packageData) => {
  const {
    packageName,
    description,
    price,
    duration,
    accommodationId,
    destinationId,
  } = packageData;

  const query = `INSERT INTO packages (package_name,
  description, price, duration, accommodation_id, destination_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
  const values = [
    packageName, // $1
    description, // $2
    price, // $3
    duration, // $4
    accommodationId, // $5
    destinationId, // $6
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updatePackageById = async (id, packageData) => {
  const { packageName, description, price, duration } = packageData;

  const query = `UPDATE packages SET package_name = $1, description = $2, price = $3, duration = $4 WHERE package_id = $6 RETURNING *;`;
  const values = [packageName, description, price, duration, id];
  const result = await pool.query(query, values);
  // console.log(result.rows[0]); // debug
  // console.log("Received data:", packageData); // debug
  return result.rows[0];
};

const deletePackageById = async (id) => {
  const query = "DELETE FROM packages WHERE package_id = $1";
  await pool.query(query, [id]);
};

module.exports = {
  getAllPackages,
  addPackage,
  updatePackageById,
  deletePackageById,
};
