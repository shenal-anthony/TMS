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
    d.destination_name
    FROM PUBLIC."destinations" d
    JOIN PUBLIC."packages_destinations" pd ON d.destination_id = pd.destination_id
    WHERE pd.package_id = $1;
  `;
  const result = await pool.query(query, [packageId]);
  return result.rows;
};

// update package_destination
const updatePackageDestination = async (packageId, destinationId) => {
    console.log("🚀 ~ packageDestinationModel.js:76 ~ updatePackageDestination ~ destinationId:", destinationId);
    console.log("🚀 ~ packageDestinationModel.js:76 ~ updatePackageDestination ~ packageId:", packageId);
    
  const query = `
    UPDATE PUBLIC."packages_destinations"
    SET destination_id = $2
    WHERE package_id = $1
    RETURNING *;
  `;
  const result = await pool.query(query, [packageId, destinationId]);
  return result.rows[0];
};

module.exports = {
  addPackageDestination,
  getDestinationsByPackageId,
  updatePackageDestination,
};
