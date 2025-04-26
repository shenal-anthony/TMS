const destination = require("../models/destinationModel");
const path = require("path");
const fs = require("fs");

const baseUrl = process.env.BASE_URL || "http://localhost:8000"; // your backend URL

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.body.folder || "others"}/${
      req.file.filename
    }`;

    const newDestination = await destination.addDestination({
      pictureUrl: `${baseUrl}${fileUrl}`, // Save full URL
      destinationName: req.body.destination_name || "Unnamed Destination",
      description: req.body.description || "",
      folder: req.body.folder,
    });
    console.log(
      "🚀 ~ uploadController.js:21 ~ uploadFile ~ newDestination:",
      newDestination
    );

    res.status(201).json({
      success: true,
      message: "File uploaded and destination created successfully",
      fileUrl: `${baseUrl}${fileUrl}`,
      destination: newDestination,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: "File upload failed",
      details: error.message,
    });
  }
};

const getFiles = async (req, res) => {
  try {
    const destinations = await destination.getAllDestinations();

    const imagesWithStatus = await Promise.all(
      destinations
        .filter((dest) => dest.picture_url) // only destinations with picture_url
        .map(async (dest) => {
          const localPath = path.join(
            __dirname,
            "../public",
            dest.picture_url.replace(baseUrl, "") // remove baseUrl if already full
          );

          const exists = fs.existsSync(localPath);
          return {
            ...dest,
            exists,
          };
        })
    );

    const validImages = imagesWithStatus.filter((img) => img.exists);

    res.status(200).json({
      success: true,
      count: validImages.length,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({
      error: "Failed to fetch images",
      details: error.message,
    });
  }
};

module.exports = { uploadFile, getFiles };
