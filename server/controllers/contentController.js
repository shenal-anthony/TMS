const tourist = require("../models/destinationModel");
const pkg = require("../models/packageModel");
const accommodation = require("../models/accommodationModel");
const event = require("../models/eventModel");
const tour = require("../models/tourModel");
const TourDest = require("../models/tourDestinationModel");
const TourAcc = require("../models/tourAccommodationModel");
const pkgDest = require("../models/packageDestinationModel");
const pkgAcc = require("../models/packageAccommodationModel");

const baseUrl = process.env.BASE_URL;

const extractLatLonFromUrl = (url) => {
  const lonMatch = url.match(/2d([-.\d]+)/);
  const latMatch = url.match(/3d([-.\d]+)/);
  if (latMatch && lonMatch) {
    return {
      lat: parseFloat(latMatch[1]),
      lon: parseFloat(lonMatch[1]),
    };
  }
  return null;
};

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

    // Extract lat/lon from location_url
    const coords = extractLatLonFromUrl(content.location_url);
    if (!coords) {
      return res.status(400).json({ message: "Invalid location_url format" });
    }

    content.latitude = coords.lat;
    content.longitude = coords.lon;

    res.json(content);
  } catch (error) {
    console.error("Error in getDestination:", error.message);
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

    if (!uploadedImage) {
      return res.status(400).json({ message: "Destination image is required" });
    }

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
const getPackageDetailsWithTours = async (req, res) => {
  try {
    // Fetch all packages
    const packages = await pkg.getAllPackages();
    if (packages.length === 0) {
      return res.status(404).json({ error: "No packages found" });
    }

    // Process each package
    const responses = await Promise.all(
      packages.map(async (packageData) => {
        // Fetch accommodation-related tours
        const accommodationTours = await TourAcc.getTourDetailsByAccId(
          packageData.accommodation_id
        );

        // Fetch destination-related tours
        const destinationTours = await TourDest.getTourDetailsByDesId(
          packageData.destination_id
        );

        // Structure the response for this package
        return {
          package: {
            packageId: packageData.packageId || packageData.package_id,
            packageName: packageData.packageName || packageData.package_name,
            description: packageData.description,
            price: packageData.price,
            duration: packageData.duration,
            accommodationId: packageData.accommodation_id,
            destinationId: packageData.destination_id,
          },
          accommodation: accommodationTours || [],
          destination: destinationTours || [],
        };
      })
    );

    // console.log(
    //   "🚀 ~ packageController.js ~ getPackageDetailsWithTours ~ responses:",
    //   responses
    // );

    res.status(200).json(responses);
  } catch (error) {
    console.error("Error in getPackageDetailsWithTours:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get all
const getAllPackagesDetails = async (req, res) => {
  try {
    // Fetch all packages
    const packages = await pkg.getAllPackages();

    // Build response by fetching accommodations and destinations for each package
    const response = await Promise.all(
      packages.map(async (pkg) => {
        // Fetch accommodations
        const accommodations = await pkgAcc.getAccommodationsByPackageId(
          pkg.package_id
        );

        // Fetch destinations
        const destinations = await pkgDest.getDestinationsByPackageId(
          pkg.package_id
        );

        // Construct package object
        return {
          package: {
            packageId: pkg.package_id,
            packageName: pkg.package_name,
            description: pkg.description,
            price: parseFloat(pkg.price),
            duration: pkg.duration,
          },
          accommodation: accommodations,
          destination: destinations,
        };
      })
    );

    res.json(response);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res
      .status(500)
      .json({ message: "Error fetching packages", error: error.message });
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

// get package details
const getPackageDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const content = await pkg.getPackageDetailsById(id);
    if (!content) {
      return res.status(404).json({ message: "package not found" });
    }

    // Extract lat/lon from location_url
    const coords = extractLatLonFromUrl(content.location_url);
    if (!coords) {
      return res.status(400).json({ message: "Invalid location_url format" });
    }

    content.latitude = coords.lat;
    content.longitude = coords.lon;

    res.json(content);
    // console.log(
    //   "🚀 ~ contentController.js:219 ~ getPackageDetails ~ content:",
    //   content
    // );
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
    if (
      !body.package_name ||
      typeof body.package_name !== "string" ||
      !body.package_name.trim()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or missing package name" });
    }

    if (
      !body.description ||
      typeof body.description !== "string" ||
      !body.description.trim()
    ) {
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

    // Validate accommodation_ids (array or comma-separated string)
    let accommodationIds = [];
    if (body.accommodation_ids) {
      if (Array.isArray(body.accommodation_ids)) {
        accommodationIds = body.accommodation_ids
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      } else if (typeof body.accommodation_ids === "string") {
        accommodationIds = body.accommodation_ids
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));
      }
    }
    if (accommodationIds.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one valid accommodation ID is required" });
    }

    // Validate destination_ids (array or comma-separated string)
    let destinationIds = [];
    if (body.destination_ids) {
      if (Array.isArray(body.destination_ids)) {
        destinationIds = body.destination_ids
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      } else if (typeof body.destination_ids === "string") {
        destinationIds = body.destination_ids
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));
      }
    }
    if (destinationIds.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one valid destination ID is required" });
    }

    // Construct data for the package model
    const newPackageData = {
      packageName: body.package_name.trim(),
      description: body.description.trim(),
      price: parseFloat(body.price),
      duration: parseInt(body.duration),
      // Use the first accommodation and destination as defaults for the packages table
      accommodationId: accommodationIds[0], // Optional: Remove if not needed
      destinationId: destinationIds[0], // Optional: Remove if not needed
    };

    // Create the package
    const newContent = await pkg.addPackage(newPackageData);

    // Add associations to junction tables
    if (accommodationIds.length > 0) {
      await pkgAcc.addPackageAccommodation(
        newContent.package_id,
        accommodationIds
      );
    }

    if (destinationIds.length > 0) {
      await pkgDest.addPackageDestination(
        newContent.package_id,
        destinationIds
      );
    }

    // add a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const fullPackage = {
      package: {
        packageId: newContent.package_id,
        packageName: newContent.package_name,
        description: newContent.description,
        price: parseFloat(newContent.price),
        duration: parseInt(newContent.duration),
      },
      accommodation: accommodationIds,
      destination: destinationIds,
    };

    res.json(fullPackage);
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

    // Validate and update package_name
    if (body.package_name !== undefined) {
      if (typeof body.package_name !== "string" || !body.package_name.trim()) {
        return res
          .status(400)
          .json({ message: "Invalid or missing package name" });
      }
      updatedPackageData.packageName = body.package_name.trim();
    }

    // Validate and update description
    if (body.description !== undefined) {
      if (typeof body.description !== "string" || !body.description.trim()) {
        return res
          .status(400)
          .json({ message: "Invalid or missing description" });
      }
      updatedPackageData.description = body.description.trim();
    }

    // Validate and update price
    if (body.price !== undefined) {
      const price = parseFloat(body.price);
      if (isNaN(price) || price <= 0) {
        return res
          .status(400)
          .json({ message: "Price must be a positive number" });
      }
      updatedPackageData.price = price;
    }

    // Validate and update duration
    if (body.duration !== undefined) {
      const duration = parseInt(body.duration);
      if (isNaN(duration) || duration <= 0) {
        return res
          .status(400)
          .json({ message: "Duration must be a positive integer" });
      }
      updatedPackageData.duration = duration;
    }

    // Validate and update accommodation_ids (array or comma-separated string)
    let accommodationIds = [];
    if (body.accommodation_ids !== undefined) {
      if (Array.isArray(body.accommodation_ids)) {
        accommodationIds = body.accommodation_ids
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      } else if (typeof body.accommodation_ids === "string") {
        accommodationIds = body.accommodation_ids
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));
      }
      if (accommodationIds.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one valid accommodation ID is required" });
      }
      updatedPackageData.accommodationId = accommodationIds[0]; // Use first ID for packages table
    }

    // Validate and update destination_ids (array or comma-separated string)
    let destinationIds = [];
    if (body.destination_ids !== undefined) {
      if (Array.isArray(body.destination_ids)) {
        destinationIds = body.destination_ids
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      } else if (typeof body.destination_ids === "string") {
        destinationIds = body.destination_ids
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));
      }
      if (destinationIds.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one valid destination ID is required" });
      }
      updatedPackageData.destinationId = destinationIds[0]; // Use first ID for packages table
    }

    // Ensure at least one field is being updated
    if (
      Object.keys(updatedPackageData).length === 0 &&
      !accommodationIds.length &&
      !destinationIds.length
    ) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Update the package in the model
    let updatedPackageContent;
    if (Object.keys(updatedPackageData).length > 0) {
      updatedPackageContent = await pkg.updatePackageById(
        id,
        updatedPackageData
      );
    } else {
      // If only associations are updated, fetch the current package
      updatedPackageContent = await pkg.getPackageById(id);
      if (!updatedPackageContent) {
        return res.status(404).json({ message: "Package not found" });
      }
    }

    // Update associations in junction tables
    if (accommodationIds.length > 0) {
      await pkgAcc.updatePackageAccommodation(id, accommodationIds);
    }

    if (destinationIds.length > 0) {
      await pkgDest.updatePackageDestination(id, destinationIds);
    }

    // Fetch updated associations
    const updatedAccommodationIds =
      accommodationIds.length > 0
        ? accommodationIds
        : (await pkgAcc.getAccommodationsByPackageId(id)) || [];
    const updatedDestinationIds =
      destinationIds.length > 0
        ? destinationIds
        : (await pkgDest.getDestinationsByPackageId(id)) || [];

    // Construct response
    const fullPackage = {
      package: {
        packageId: updatedPackageContent.package_id || id,
        packageName: updatedPackageContent.package_name,
        description: updatedPackageContent.description,
        price: parseFloat(updatedPackageContent.price),
        duration: parseInt(updatedPackageContent.duration),
      },
      accommodation: updatedAccommodationIds,
      destination: updatedDestinationIds,
    };

    res.json(fullPackage);
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

    const uploadedImage = files?.accommodation?.[0];

    if (!uploadedImage) {
      return res
        .status(400)
        .json({ message: "Accommodation image is required" });
    }

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
      accommodationName: body.accommodationName,
      amenities: body.amenities,
      serviceUrl: body.serviceUrl,
      contactNumber: body.contactNumber,
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
  try {
    // For FormData, the fields are available in req.body
    const { body, file } = req;

    const eventData = {
      eventName: body.eventName,
      startDate: body.startDate,
      groupSize: body.groupSize || null, // Handle optional fields
      description: body.description || null,
    };

    console.log("Creating event with data:", eventData);
    const newContent = await event.addEvent(eventData);

    res.status(201).json(newContent);
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({
      message: "Error adding event",
      error: error.message,
    });
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

// add Tour
// activity, picture_url
const addTour = async (req, res) => {
  const { body, files } = req;

  try {
    const uploadedImage = files?.tour?.[0];
    let pictureUrl = null;

    if (!uploadedImage) {
      return res.status(400).json({ message: "Tour image is required" });
    }

    if (uploadedImage) {
      const filePath = `/uploads/tours/${uploadedImage.filename}`;
      pictureUrl = `${baseUrl}${filePath}`;
    }

    const newTourData = {
      body,
      picture_url: pictureUrl,
    };

    if (!uploadedImage) {
      return res.status(400).json({
        success: false,
        message: "Activity and image are required to create tour",
      });
    }

    // Create the tour
    const createdTour = await tour.addTour(newTourData);
    console.log(
      "🚀 ~ contentController.js:662 ~ addTour ~ createdTour:",
      createdTour
    );

    // Handle packageDestination
    const packageDestinationData = {
      tourId: createdTour.tour_id,
      destinationId: body.destination_id,
    };

    if (!packageDestinationData.destinationId) {
      return res.status(400).json({
        success: false,
        message: "Destination ID is required for package destination",
      });
    }

    await TourDest.addPackageDestination(packageDestinationData);

    // Handle packageAccommodation
    const packageAccommodationData = {
      tourId: createdTour.tour_id,
      accommodationId: body.accommodation_id,
    };

    if (!packageAccommodationData.accommodationId) {
      return res.status(400).json({
        success: false,
        message: "Accommodation ID is required for package accommodation",
      });
    }

    await TourAcc.addPackageAccommodation(packageAccommodationData);

    res.status(201).json({
      success: true,
      message: "Tour and associated packages created successfully",
      data: {
        tour: createdTour,
        packageDestination: packageDestinationData,
        packageAccommodation: packageAccommodationData,
      },
    });
  } catch (error) {
    console.error("Error creating tour and packages:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// update Tour
const updateTour = async (req, res) => {
  const { id } = req.params;
  const { body, files } = req;

  try {
    const updatedData = {
      activity: body.activity,
    };

    const uploadedImage = files?.tour?.[0];

    if (uploadedImage) {
      const fileUrl = `/uploads/tours/${uploadedImage.filename}`;
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

    const updatedContent = await tour.updateTour(id, updatedData);

    res.json({
      success: true,
      message: "Tour updated successfully",
      data: updatedContent,
    });
  } catch (error) {
    console.error("Error updating Tour:", error);
    res.status(500).json({
      message: "Error updating Tour",
      error: error.message,
    });
  }
};

// delete Tour
const deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    await tour.deleteTourById(id);
    res.json({ message: "Tour deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting Tour", error: error.message });
  }
};

// get all tours
const getAllTours = async (req, res) => {
  try {
    const contents = await tour.getAllTours();
    res.json(contents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tours", error: error.message });
  }
};

// get tour by id
const getTour = async (req, res) => {
  const { id } = req.params;
  try {
    const content = await tour.getTourById(id);
    if (!content) {
      return res.status(404).json({ message: "Tour not found" });
    }
    res.json(content);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tour", error: error.message });
  }
};

// get tour details
const getTourDetails = async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch tour details
    const tourData = await tour.getTourById(id);
    if (!tourData) {
      return res.status(404).json({ error: "Tour not found" });
    }

    // Fetch destinations and accommodations
    const destinations = await TourDest.getDestinationsByTourId(id);
    const accommodations = await TourAcc.getAccommodationsByTourId(id);

    // Combine results
    const response = {
      tourData,
      destinations,
      accommodations,
    };
    console.log(
      "🚀 ~ contentController.js:804 ~ getTourDetails ~ response:",
      response
    );

    res.json(response);
  } catch (error) {
    console.error("Error in getTourDetails:", error);
    res.status(500).json({ error: "Failed to fetch tour details" });
  }
};

module.exports = {
  getAllDestinations,
  getDestination,
  addDestination,
  deleteDestination,
  updateDestination,
  getPackageDetailsWithTours,
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
  addTour,
  getAllTours,
  getTour,
  updateTour,
  getPackageDetails,
  deleteTour,
  getTourDetails,
  getAllPackagesDetails,
};
