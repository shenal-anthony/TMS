const pool = require("../db");

const addPackageAccommodation = async (packageId, accommodationIds) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (!Number.isInteger(packageId) || packageId <= 0) {
      throw new Error("Invalid package ID");
    }
    if (!Array.isArray(accommodationIds) || accommodationIds.length === 0) {
      throw new Error("At least one accommodation ID is required");
    }
    if (!accommodationIds.every((id) => Number.isInteger(id) && id > 0)) {
      throw new Error("All accommodation IDs must be positive integers");
    }

    // Validate packageId exists
    const packageCheck = await client.query(
      'SELECT 1 FROM PUBLIC."packages" WHERE PACKAGE_ID = $1',
      [packageId]
    );
    if (packageCheck.rowCount === 0) {
      throw new Error("Package ID does not exist");
    }

    // Validate accommodationIds exist
    const validAccommodationIds = (
      await client.query(
        'SELECT ACCOMMODATION_ID FROM PUBLIC."accommodations" WHERE ACCOMMODATION_ID = ANY($1)',
        [accommodationIds]
      )
    ).rows.map((row) => row.accommodation_id);
    if (validAccommodationIds.length !== accommodationIds.length) {
      throw new Error("One or more accommodation IDs do not exist");
    }

    const insertedRows = [];
    for (const accommodationId of accommodationIds) {
      const result = await client.query(
        'INSERT INTO PUBLIC."packages_accommodations" (PACKAGE_ID, ACCOMMODATION_ID) VALUES ($1, $2) RETURNING *',
        [packageId, accommodationId]
      );
      insertedRows.push(result.rows[0]);
    }
    // console.log(
    // "🚀 ~ packageAccommodationModel.js:45 ~ addPackageAccommodation ~ insertedRows:",
    // insertedRows
    // );

    await client.query("COMMIT");
    return insertedRows;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding package accommodations:", error);
    throw error;
  } finally {
    client.release();
  }
};

const getAccommodationsByPackageId = async (packageId) => {
  const query = `
    SELECT 
      a.accommodation_id,
      a.accommodation_name,
      a.accommodation_type
    FROM PUBLIC."packages_accommodations" pa
    JOIN PUBLIC."accommodations" a ON pa.accommodation_id = a.accommodation_id
    WHERE pa.package_id = $1
  `;
  try {
    const result = await pool.query(query, [packageId]);
    return result.rows;
  } catch (error) {
    console.error(
      `Error fetching accommodations for package ${packageId}:`,
      error
    );
    throw error;
  }
};

// update package accommodation
const updatePackageAccommodation = async (packageId, accommodationId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Validate accommodationId exists
    const accommodationCheck = await client.query(
      'SELECT 1 FROM PUBLIC."accommodations" WHERE ACCOMMODATION_ID = $1',
      [accommodationId]
    );

    if (accommodationCheck.rowCount === 0) {
      throw new Error("Accommodation ID does not exist");
    }

    const result = await client.query(
      'UPDATE PUBLIC."packages_accommodations" SET ACCOMMODATION_ID = $2 WHERE PACKAGE_ID = $1 RETURNING *',
      [packageId, accommodationId]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating package accommodation:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  addPackageAccommodation,
  getAccommodationsByPackageId,
  updatePackageAccommodation,
};
