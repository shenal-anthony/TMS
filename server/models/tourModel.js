const pool = require("../db");

// get all tours
const getAllTours = async () => {
  const query = "SELECT * FROM tours";
  const result = await pool.query(query);
  return result.rows;
};

// get a tour by id
const getTourById = async (id) => {
  const query = "SELECT * FROM tours WHERE tour_id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// get tour details by id
const getTourDetailsById = async (id) => {
  const query = `
    SELECT 
      t.tour_id,
      t.activity,
      t.picture_url,
      d.destination_id,
      d.destination_name,
      d.description AS destination_description,
      a.accommodation_id,
      a.accommodation_name,
      a.amenities
    FROM tours t
    JOIN package_destinations pd ON t.tour_id = pd.tour_id
    JOIN destinations d ON pd.destination_id = d.destination_id
    JOIN package_accommodations pa ON t.tour_id = pa.tour_id
    JOIN accommodations a ON pa.accommodation_id = a.accommodation_id
    WHERE t.tour_id = $1;
  `;
  const result = await pool.query(query, [id]);
  console.log("🚀 ~ tourModel.js:36 ~ getTourDetailsById ~ result:", result);
  return result.rows[0];
}

// add a new tour
const addTour = async (newTourData) => {
  const { body, picture_url } = newTourData;
  const { activity } = body;

  try {
    const newTour = await pool.query(
      "INSERT INTO tours (activity, picture_url) VALUES ($1, $2) RETURNING *",
      [activity, picture_url]
    );
    return newTour.rows[0];
  } catch (error) {
    console.error("Error in addTour:", error);
    throw error;
  }
};

// update a tour
const updateTour = async (id, tourData, file) => {
  const fields = [];
  const values = [];
  let index = 1;

  try {
    // Map tour fields to database column names
    if (tourData.activity !== undefined && tourData.activity !== null) {
      fields.push(`activity = $${index}`);
      values.push(tourData.activity);
      index++;
    }

    // Handle image if provided
    if (file) {
      const filePath = `/uploads/tours/${file.filename}`;
      const pictureUrl = `${baseUrl}${filePath}`;
      fields.push(`picture_url = $${index}`);
      values.push(pictureUrl);
      index++;
    } else if (
      tourData.pictureUrl !== undefined &&
      tourData.pictureUrl !== null
    ) {
      fields.push(`picture_url = $${index}`);
      values.push(tourData.pictureUrl);
      index++;
    }

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Update tour table if fields are provided
      let updatedTour = null;
      if (fields.length > 0) {
        const query = `
          UPDATE tours 
          SET ${fields.join(", ")} 
          WHERE tour_id = $${index} 
          RETURNING *`;
        values.push(id);
        const result = await client.query(query, values);

        if (result.rows.length === 0) {
          throw new Error("Tour not found");
        }
        updatedTour = result.rows[0];
      } else {
        // Check if tour exists
        const checkTour = await client.query(
          "SELECT * FROM tours WHERE tour_id = $1",
          [id]
        );
        if (checkTour.rows.length === 0) {
          throw new Error("Tour not found");
        }
        updatedTour = checkTour.rows[0];
      }

      // Update package_destination if destination_id is provided
      if (
        tourData.destination_id !== undefined &&
        tourData.destination_id !== null
      ) {
        await client.query(
          `INSERT INTO package_destination (tour_id, destination_id)
           VALUES ($1, $2)
           ON CONFLICT (tour_id) 
           DO UPDATE SET destination_id = EXCLUDED.destination_id`,
          [id, tourData.destination_id]
        );
      }

      // Update package_accommodation if accommodation_id is provided
      if (
        tourData.accommodation_id !== undefined &&
        tourData.accommodation_id !== null
      ) {
        await client.query(
          `INSERT INTO package_accommodation (tour_id, accommodation_id)
           VALUES ($1, $2)
           ON CONFLICT (tour_id) 
           DO UPDATE SET accommodation_id = EXCLUDED.accommodation_id`,
          [id, tourData.accommodation_id]
        );
      }

      await client.query("COMMIT");
      return updatedTour;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating tour:", error);
    throw error;
  }
};

// delete a tour
const deleteTourById = async (id) => {
  try {
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Delete from package_destination
      await client.query("DELETE FROM package_destinations WHERE tour_id = $1", [
        id,
      ]);

      // Delete from package_accommodation
      await client.query(
        "DELETE FROM package_accommodations WHERE tour_id = $1",
        [id]
      );

      // Delete from tours
      const query = "DELETE FROM tours WHERE tour_id = $1";
      const result = await client.query(query, [id]);

      if (result.rowCount === 0) {
        throw new Error("Tour not found");
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in deleteTourById:", error);
    throw error;
  }
};

module.exports = {
  getAllTours,
  getTourById,
  addTour,
  updateTour,
  deleteTourById,
  getTourDetailsById,
};
