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

const getAccommodationDetailsByPackageId = async (packageId) => {
  const query = `
    SELECT 
      a.accommodation_id,
      a.accommodation_name,
      a.location_url,
      a.picture_url,
      a.contact_number,
      a.amenities,
      a.updated_at,
      a.service_url,
      a.accommodation_type
    FROM PUBLIC."packages_accommodations" pa
    JOIN PUBLIC."accommodations" a ON pa.accommodation_id = a.accommodation_id
    WHERE pa.package_id = $1;
  `;
  const result = await pool.query(query, [packageId]);
  return result.rows.map(row => ({
    accommodation_id: row.accommodation_id,
    accommodation_name: row.accommodation_name,
    location_url: row.location_url,
    picture_url: row.picture_url,
    contact_number: row.contact_number,
    amenities: row.amenities,
    updated_at: row.updated_at,
    service_url: row.service_url,
    accommodation_type: row.accommodation_type
  }));
};

// update package accommodation
const updatePackageAccommodation = async (packageId, accommodationIds) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Validate packageId exists
    const packageCheck = await client.query(
      'SELECT 1 FROM PUBLIC."packages" WHERE PACKAGE_ID = $1',
      [packageId]
    );
    if (packageCheck.rowCount === 0) {
      throw new Error("Package ID does not exist");
    }

    // Validate accommodationIds
    if (!Array.isArray(accommodationIds) || accommodationIds.length === 0) {
      throw new Error("At least one valid accommodation ID is required");
    }

    // Validate all accommodationIds exist
    const accommodationCheck = await client.query(
      'SELECT ACCOMMODATION_ID FROM PUBLIC."accommodations" WHERE ACCOMMODATION_ID = ANY($1)',
      [accommodationIds]
    );
    const validAccommodationIds = accommodationCheck.rows.map(
      (row) => row.accommodation_id
    );
    if (validAccommodationIds.length !== accommodationIds.length) {
      const invalidIds = accommodationIds.filter(
        (id) => !validAccommodationIds.includes(id)
      );
      throw new Error(`Invalid accommodation IDs: ${invalidIds.join(", ")}`);
    }

    // Delete existing associations
    await client.query(
      'DELETE FROM PUBLIC."packages_accommodations" WHERE PACKAGE_ID = $1',
      [packageId]
    );

    // Insert new associations
    const insertQuery = `
      INSERT INTO PUBLIC."packages_accommodations" (PACKAGE_ID, ACCOMMODATION_ID)
      VALUES ${accommodationIds
        .map((_, index) => `($1, $${index + 2})`)
        .join(", ")}
      RETURNING *;
    `;
    const insertValues = [packageId, ...accommodationIds];
    const result = await client.query(insertQuery, insertValues);
    console.log("🚀 ~ packageAccommodationModel.js:133 ~ updatePackageAccommodation ~ insertValues:", insertValues);

    await client.query("COMMIT");
    return result.rows; // Return all inserted rows
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating package accommodation:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Get package IDs by accommodation IDs
async function getPackageIdsByAccommodations(accommodationIds) {
  if (!accommodationIds.length) return [];
  const query = `
    SELECT DISTINCT package_id
    FROM packages_accommodations
    WHERE accommodation_id = ANY($1)
  `;
  const result = await pool.query(query, [accommodationIds]);
  return result.rows.map(row => row.package_id);
}

module.exports = {
  addPackageAccommodation,
  getAccommodationsByPackageId,
  updatePackageAccommodation,
  getAccommodationDetailsByPackageId,
  getPackageIdsByAccommodations
};
