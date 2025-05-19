const pool = require("../db");

const addPackageDestination = async (packageId, destinationIds) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (!Number.isInteger(packageId) || packageId <= 0) {
      throw new Error("Invalid package ID");
    }
    if (!Array.isArray(destinationIds) || destinationIds.length === 0) {
      throw new Error("At least one destination ID is required");
    }
    if (!destinationIds.every((id) => Number.isInteger(id) && id > 0)) {
      throw new Error("All destination IDs must be positive integers");
    }

    // Validate packageId exists
    const packageCheck = await client.query(
      'SELECT 1 FROM PUBLIC."packages" WHERE package_id = $1',
      [packageId]
    );
    if (packageCheck.rowCount === 0) {
      throw new Error("Package ID does not exist");
    }

    // Validate destinationIds exist
    const validDestinationIds = (
      await client.query(
        'SELECT destination_id FROM PUBLIC."destinations" WHERE destination_id = ANY($1)',
        [destinationIds]
      )
    ).rows.map((row) => row.destination_id);
    if (validDestinationIds.length !== destinationIds.length) {
      throw new Error("One or more destination IDs do not exist");
    }

    const insertedRows = [];
    for (const destinationId of destinationIds) {
      const result = await client.query(
        'INSERT INTO PUBLIC."packages_destinations" (package_id, destination_id) VALUES ($1, $2) RETURNING *',
        [packageId, destinationId]
      );
      insertedRows.push(result.rows[0]);
    }
    // console.log(
    // "🚀 ~ packageDestinationModel.js:46 ~ addPackageDestination ~ insertedRows:",
    // insertedRows
    // );

    await client.query("COMMIT");
    return insertedRows;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding package destinations:", error);
    throw error;
  } finally {
    client.release();
  }
};

const getDestinationsByPackageId = async (packageId) => {
  const query = `
    SELECT 
    d.destination_id,
    d.location_url,
    d.destination_name
    FROM PUBLIC."destinations" d
    JOIN PUBLIC."packages_destinations" pd ON d.destination_id = pd.destination_id
    WHERE pd.package_id = $1;
  `;
  const result = await pool.query(query, [packageId]);
  return result.rows;
};

const getDestinationDestailsByPackageId = async (packageId) => {
  const query = `
    SELECT 
      d.destination_id,
      d.destination_name,
      d.description,
      d.location_url,
      d.picture_url
    FROM PUBLIC."packages_destinations" pd
    JOIN PUBLIC."destinations" d ON pd.destination_id = d.destination_id
    WHERE pd.package_id = $1;
  `;
  const result = await pool.query(query, [packageId]);
  return result.rows.map((row) => ({
    destination_id: row.destination_id,
    destination_name: row.destination_name,
    description: row.description,
    location_url: row.location_url,
    picture_url: row.picture_url,
  }));
};

// update package_destination
const updatePackageDestination = async (packageId, destinationIds) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Validate packageId exists
    const packageCheck = await client.query(
      'SELECT 1 FROM PUBLIC."packages" WHERE package_id = $1',
      [packageId]
    );
    if (packageCheck.rowCount === 0) {
      throw new Error("Package ID does not exist");
    }

    // Validate destinationIds
    if (!Array.isArray(destinationIds) || destinationIds.length === 0) {
      throw new Error("At least one valid destination ID is required");
    }

    // Validate all destinationIds exist
    const destinationCheck = await client.query(
      'SELECT destination_id FROM PUBLIC."destinations" WHERE destination_id = ANY($1)',
      [destinationIds]
    );
    const validDestinationIds = destinationCheck.rows.map(
      (row) => row.destination_id
    );
    if (validDestinationIds.length !== destinationIds.length) {
      const invalidIds = destinationIds.filter(
        (id) => !validDestinationIds.includes(id)
      );
      throw new Error(`Invalid destination IDs: ${invalidIds.join(", ")}`);
    }

    // Delete existing associations
    await client.query(
      'DELETE FROM PUBLIC."packages_destinations" WHERE package_id = $1',
      [packageId]
    );

    // Insert new associations
    const insertQuery = `
      INSERT INTO PUBLIC."packages_destinations" (package_id, destination_id)
      VALUES ${destinationIds
        .map((_, index) => `($1, $${index + 2})`)
        .join(", ")}
      RETURNING *;
    `;
    const insertValues = [packageId, ...destinationIds];
    const result = await client.query(insertQuery, insertValues);
    console.log(
      "🚀 ~ packageDestinationModel.js:124 ~ updatePackageDestination ~ insertValues:",
      insertValues
    );

    await client.query("COMMIT");
    return result.rows; // Return all inserted rows
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating package destination:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Get package IDs by destination IDs
async function getPackageIdsByDestinations(destinationIds) {
  if (!destinationIds.length) return [];
  const query = `
    SELECT DISTINCT package_id
    FROM packages_destinations
    WHERE destination_id = ANY($1)
  `;
  const result = await pool.query(query, [destinationIds]);
  return result.rows.map(row => row.package_id);
}

module.exports = {
  addPackageDestination,
  getDestinationsByPackageId,
  updatePackageDestination,
  getDestinationDestailsByPackageId,
  getPackageIdsByDestinations,
};
