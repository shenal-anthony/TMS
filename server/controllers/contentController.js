const tourist = require("../models/destinationModel");
const pkg = require("../models/packageModel");
const accommodation = require("../models/accommodationModel");
const event = require("../models/eventModel");

const path = require("path");

// destinations controller
// get all
const getAllDestinations = async (req, res) => {
  try {
    const contents = await tourist.getAllDestinations();
    res.json(contents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching destination", error: error.message });
  }
};
// get by id
const getDestination = async (req, res) => {
  const { id } = req.params;
  try {
    const content = await tourist.getDestinationById(id);
    if (!content) {
      return res.status(404).json({ message: "Destination not found" });
    }
    res.json(content);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching destination", error: error.message });
  }
}
// add
const addDestination = async (req, res) => {
  const { body } = req;
  try {
    const newContent = await tourist.addDestination(body);
    res.json(newContent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding destination", error: error.message });
  }
};
// update
const updateDestination = async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  try {
    const updatedContent = await tourist.updateDestinationById(id, body);
    res.json(updatedContent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating destination", error: error.message });
  }
};
// delete
const deleteDestination = async (req, res) => {
  const { id } = req.params;
  try {
    await tourist.deleteDestinationById(id);
    res.json({ message: "Guide deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting destination", error: error.message });
  }
};

// packages controller
// get all
const getAllPackages = async (req, res) => {
  try {
    const contents = await pkg.getAllPackages();
    res.json(contents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching destination", error: error.message });
  }
};
// get by id
const getPackage = async (req, res) => {
  const { id } = req.params;
  try {
    const content = await pkg.getPackageById(id);
    if (!content) {
      return res.status(404).json({ message: "package not found" });
    }
    res.json(content);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching package", error: error.message });
  }
}
// add
const addPackage = async (req, res) => {
  const { body } = req;
  try {
    const newContent = await pkg.addPackage(body);
    res.json(newContent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding destination", error: error.message });
  }
};
// update
const updatePackage = async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  try {
    const updatedContent = await pkg.updatePackageById(id, body);
    res.json(updatedContent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating destination", error: error.message });
  }
};
// delete
const deletePackage = async (req, res) => {
  const { id } = req.params;
  try {
    await pkg.deletePackageById(id);
    res.json({ message: "Guide deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting destination", error: error.message });
  }
};

// accommodation controller
// get all
const getAllAccommodations = async (req, res) => {
  try {
    const contents = await accommodation.getAllAccommodations();
    res.json(contents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching accommodations", error: error.message });
  }
};
// get by id
const getAccommodation = async (req, res) => {
  const { id } = req.params;
  try {
    const content = await accommodation.getAccommodationById(id);
    if (!content) {
      return res.status(404).json({ message: "Accommodation not found" });
    }
    res.json(content);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching accommodation", error: error.message });
  }
};
// add
const addAccommodation = async (req, res) => {
  try {
    const {
      accommodationName,
      locationUrl,
      contactNumber,
      amenities,
      serviceUrl,
      accommodationType,
      agreeTerms,
    } = req.body;

    // Check if the user agreed to the terms
    if (agreeTerms !== "true") {
      return res
        .status(400)
        .json({ message: "You must agree to the terms and conditions" });
    }

    let pictureUrl = null;

    // Handle file upload
    if (req.files && req.files.picture) {
      const picture = req.files.picture;
      const allowedMimeTypes = ["image/jpeg", "image/png"];

      if (!allowedMimeTypes.includes(picture.mimetype)) {
        return res
          .status(400)
          .json({ message: "Only JPEG and PNG images are allowed" });
      }

      // 16MB limit
      if (picture.size > 16 * 1024 * 1024) {
        return res
          .status(400)
          .json({ message: "Image size exceeds 16MB limit" });
      }

      const fileName = `${Date.now()}_${picture.name}`;
      pictureUrl = `/uploads/accommodations/${fileName}`;
      await picture.mv(path.join(__dirname, "../public", pictureUrl));
    }

    // Create accommodation record in database
    const newAccommodation = await accommodation.createAccommodation({
      accommodationName,
      locationUrl,
      pictureUrl,
      contactNumber,
      amenities: Array.isArray(amenities)
        ? amenities
        : amenities.split(",").map((item) => item.trim()),
      serviceUrl,
      accommodationType,
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Accommodation registered successfully",
    });
  } catch (error) {
    console.error("Accommodation registration error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
// update
const updateAccommodation = async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  try {
    const updatedContent = await accommodation.updateAccommodationById(
      id,
      body
    );
    res.json(updatedContent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating accommodation", error: error.message });
  }
  console.log("🚀 ~ updateAccommodation ~ updatedContent:", updatedContent);
};
// delete
const deleteAccommodation = async (req, res) => {
  const { id } = req.params;
  try {
    await accommodation.deleteAccommodationById(id);
    res.json({ message: "Accommodation deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting accommodation", error: error.message });
  }
};

// events controller
// get all
const getAllEvents = async (req, res) => {
  try {
    const contents = await event.getAllEvents();
    res.json(contents);
    console.log("🚀 ~ getAllEvents ~ contents:", contents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching events", error: error.message });
  }
};
// add
const addEvent = async (req, res) => {
  const { body } = req;
  try {
    const newContent = await event.addEvent(body);
    res.json(newContent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding event", error: error.message });
  }
};
// update

// delete
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await event.deleteEventById(id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting event", error: error.message });
  }
}

module.exports = {
  getAllDestinations,
  getDestination,
  addDestination,
  deleteDestination,
  updateDestination,
  getAllPackages,
  getPackage,
  addPackage,
  updatePackage,
  deletePackage,
  addAccommodation,
  getAllAccommodations,
  getAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getAllEvents,
  addEvent,
  deleteEvent
};
