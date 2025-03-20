const tourist = require("../models/destinationModel");

// get all
const getAllContent = async (req, res) => {
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
const addContent = async (req, res) => {
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
const updateContent = async (req, res) => {
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
const deleteContent = async (req, res) => {
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

module.exports = { getAllContent, addContent, deleteContent, updateContent };
