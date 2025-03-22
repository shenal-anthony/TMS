const tourist = require("../models/destinationModel");
const package = require("../models/packageModel");

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
    const contents = await package.getAllPackages();
    res.json(contents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching destination", error: error.message });
  }
};

// add
const addPackage = async (req, res) => {
  const { body } = req;
  try {
    const newContent = await package.addPackage(body);
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
    const updatedContent = await package.updatePackageById(id, body);
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
    await package.deletePackageById(id);
    res.json({ message: "Guide deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting destination", error: error.message });
  }
};

module.exports = {
  getAllDestinations,
  addDestination,
  deleteDestination,
  updateDestination,
  getAllPackages,
  addPackage,
  updatePackage,
  deletePackage,
};
