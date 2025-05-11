const tourist = require("../models/destinationModel");
const pkg = require("../models/packageModel");
const accommodation = require("../models/accommodationModel");
const event = require("../models/eventModel");

const baseUrl = process.env.BASE_URL;

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
};

// add
const addDestination = async (req, res) => {
  const { body, files } = req;

  try {
    const uploadedImage = files?.destination?.[0];
    let pictureUrl = null;

    if (uploadedImage) {
      const filePath = `/uploads/destinations/${uploadedImage.filename}`;
      pictureUrl = `${baseUrl}${filePath}`;
    }

    const newData = {
      destinationName: body.destinationName,
      description: body.description,
      weatherCondition: body.weatherCondition,
      locationUrl: body.locationUrl,
      pictureUrl: pictureUrl,
    };

    if (Object.keys(newData).length === 0 || !uploadedImage) {
      return res.status(400).json({
        success: false,
        message: "No data or image provided to create destination",
      });
    }

    const createdDestination = await tourist.addDestination(newData);

    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      data: createdDestination,
    });
  } catch (error) {
    console.error("Error creating destination:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// update
const updateDestination = async (req, res) => {
  const { id } = req.params;
  const { body, files } = req;

  try {
    const updatedData = {
      destinationName: body.destinationName,
      description: body.description,
      weatherCondition: body.weatherCondition,
      locationUrl: body.locationUrl,
    };

    const uploadedImage = files?.destination?.[0];

    if (uploadedImage) {
      const fileUrl = `/uploads/destinations/${uploadedImage.filename}`;
      const fullUrl = `${baseUrl}${fileUrl}`;
      updatedData.pictureUrl = fullUrl;
    }

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided to update",
      });
    }

    const updatedContent = await tourist.updateDestinationById(id, updatedData);

    res.json({
      success: true,
      message: "Destination updated successfully",
      data: updatedContent,
    });
  } catch (error) {
    console.error("Error updating destination:", error);
    res.status(500).json({
      message: "Error updating destination",
      error: error.message,
    });
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
};

// add
const addPackage = async (req, res) => {
  const { body } = req;

  try {
    // Validations
    if (!body.package_name || typeof body.package_name !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid or missing package name" });
    }

    if (!body.description || typeof body.description !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid or missing description" });
    }

    if (!body.price || isNaN(body.price) || parseFloat(body.price) <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }

    if (
      !body.duration ||
      isNaN(body.duration) ||
      parseInt(body.duration) <= 0
    ) {
      return res
        .status(400)
        .json({ message: "Duration must be a positive integer" });
    }

    if (!body.accommodation_id || isNaN(body.accommodation_id)) {
      return res.status(400).json({ message: "Invalid accommodation ID" });
    }

    if (!body.destination_id || isNaN(body.destination_id)) {
      return res.status(400).json({ message: "Invalid destination ID" });
    }

    // Construct data for the model
    const newPackageData = {
      packageName: body.package_name.trim(),
      description: body.description.trim(),
      price: parseFloat(body.price),
      duration: parseInt(body.duration),
      accommodationId: parseInt(body.accommodation_id),
      destinationId: parseInt(body.destination_id),
    };

    // Send to the model
    const newContent = await pkg.addPackage(newPackageData);

    res.json(newContent);
  } catch (error) {
    console.error("Error adding package:", error);
    res.status(500).json({
      message: "Error adding package",
      error: error.message,
    });
  }
};

// update
const updatePackage = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    // ID Validation
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid package ID" });
    }

    // Initialize the update data object
    const updatedPackageData = {};


    if (body.package_name) {
      if (typeof body.package_name !== "string" || !body.package_name.trim()) {
        return res.status(400).json({ message: "Invalid package name" });
      }
      updatedPackageData.packageName = body.package_name.trim();
    }

    if (body.description) {
      if (typeof body.description !== "string" || !body.description.trim()) {
        return res.status(400).json({ message: "Invalid description" });
      }
      updatedPackageData.description = body.description.trim();
    }

    // Validate and update `price`
    if (body.price) {
      const price = parseFloat(body.price);
      if (isNaN(price) || price <= 0) {
        return res
          .status(400)
          .json({ message: "Price must be a positive number" });
      }
      updatedPackageData.price = price;
    }

    // Validate and update `duration`
    if (body.duration) {
      const duration = parseInt(body.duration);
      if (isNaN(duration) || duration <= 0) {
        return res
          .status(400)
          .json({ message: "Duration must be a positive integer" });
      }
      updatedPackageData.duration = duration;
    }

    // Validate and update `accommodationId`
    if (body.accommodation_id) {
      const accommodation_id = parseInt(body.accommodation_id);
      if (isNaN(accommodation_id)) {
        return res.status(400).json({ message: "Invalid accommodation ID" });
      }
      updatedPackageData.accommodationId = accommodation_id;
    }

    // Validate and update `destinationId`
    if (body.destination_id) {
      const destination_id = parseInt(body.destination_id);
      if (isNaN(destination_id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      updatedPackageData.destinationId = destination_id;
    }

    // Ensure that at least one field is being updated
    if (Object.keys(updatedPackageData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Update the package in the model
    const updatedPackageContent = await pkg.updatePackageById(
      id,
      updatedPackageData
    );

    res.json(updatedPackageContent);
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({
      message: "Error updating package",
      error: error.message,
    });
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
  const { body, files } = req;

  try {
    // Type Checking and Data Validation
    if (!body.accommodationName || typeof body.accommodationName !== "string") {
      return res.status(400).json({ message: "Invalid accommodation name" });
    }

    if (!body.locationUrl || typeof body.locationUrl !== "string") {
      return res.status(400).json({ message: "Invalid location URL" });
    }

    if (
      !body.contactNumber ||
      typeof body.contactNumber !== "string" ||
      !/^\d{10}$/.test(body.contactNumber.trim())
    ) {
      return res
        .status(400)
        .json({ message: "Contact number must be a valid 10-digit number" });
    }

    const validAccommodationTypes = [
      "hotel",
      "resort",
      "bungalow",
      "homestay",
      "villa",
      "cabin",
      "cabana",
      "lodge",
      "camp",
      "tent",
    ];

    if (
      !body.accommodationType ||
      !validAccommodationTypes.includes(body.accommodationType)
    ) {
      return res.status(400).json({
        message: `Invalid accommodation type. Must be one of: ${validAccommodationTypes.join(
          ", "
        )}`,
      });
    }

    // Constructing the accommodation data
    const newAccommodation = {
      accommodationName: body.accommodationName,
      locationUrl: body.locationUrl ? body.locationUrl.trim() : "",
      contactNumber: body.contactNumber,
      amenities: body.amenities ? body.amenities.trim() : "",
      serviceUrl: body.serviceUrl ? body.serviceUrl.trim() : "",
      accommodationType: body.accommodationType,
      updatedAt: new Date().toISOString(),
    };

    const uploadedImage = files?.picture?.[0];

    if (uploadedImage) {
      const fileUrl = `/uploads/accommodations/${uploadedImage.filename}`;
      const fullUrl = `${baseUrl}${fileUrl}`;
      newAccommodation.pictureUrl = fullUrl;
    }

    // Create accommodation record in database
    const createdAccommodation = await accommodation.createAccommodation(
      newAccommodation
    );

    res.status(201).json({
      success: true,
      message: "Accommodation registered successfully",
      data: createdAccommodation,
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
  const { body, files } = req;

  try {
    const updatedData = {
      accommodationName: body.name,
      amenities: body.amenities,
      serviceUrl: body.serviceUrl,
      contactNumber: body.contact,
      locationUrl: body.locationUrl,
      updatedAt: new Date().toISOString(),
      accommodationType: body.accommodationType,
    };

    const uploadedImage = files?.accommodation?.[0];

    if (uploadedImage) {
      const fileUrl = `/uploads/accommodations/${uploadedImage.filename}`;
      const fullUrl = `${baseUrl}${fileUrl}`;
      updatedData.pictureUrl = fullUrl;
    } else if (body.pictureUrl) {
      updatedData.pictureUrl = body.pictureUrl; // fallback to existing image
    }

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided to update",
      });
    }

    const updatedContent = await accommodation.updateAccommodationById(
      id,
      updatedData
    );

    res.json({
      success: true,
      message: "Accommodation updated successfully",
      data: updatedContent,
    });
  } catch (error) {
    console.error("Error updating accommodation:", error);
    res.status(500).json({
      message: "Error updating accommodation",
      error: error.message,
    });
  }
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
    // console.log("🚀 ~ getAllEvents ~ contents:", contents);
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
};

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
  deleteEvent,
};
