const tourist = require("../models/touristModel");
// tourist controller

// Success message templates
const successMessages = {
  getAll: "Tourists retrieved successfully",
  getSingle: "Tourist retrieved successfully",
  register: "Tourist registered successfully",
  delete: "Tourist deleted successfully",
};

// Error message templates
const errorMessages = {
  notFound: "Tourist not found",
  existsEmail: "Tourist already exists with this email",
  existsNIC: "Tourist already exists with this NIC number",
  serverError: "Internal server error",
};

// get all
const getAllTourists = async (req, res) => {
  try {
    const contents = await tourist.getTourists();
    res.json(contents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tourists", error: error.message });
  }
};
// get by email
const getTourist = async (req, res) => {
  const { id } = req.params;
  try {
    const content = await tourist.findTouristByEmail();
    if (!content) {
      return res.status(404).json({ message: "tourist not found" });
    }
    res.json(content);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tourist", error: error.message });
  }
};
// add
const registerTourist = async (req, res) => {
  const touristData = req.body;
  // console.log(
  // "🚀 ~ touristController.js:33 ~ registerTourist ~ touristData:",
  // touristData
  // );

  try {
    const existingTourist = await tourist.findTouristByEmail(touristData.email);
    const existingTouristByNIC = await tourist.findTouristByNIC(
      touristData.nicNumber
    );
    if (existingTourist) {
      return res
        .status(400)
        .json({ success: false, message: errorMessages.existsEmail });
    }
    if (existingTouristByNIC) {
      return res
        .status(400)
        .json({ success: false, message: errorMessages.existsNIC });
    }

    const newTourist = await tourist.addTourist(touristData);
    res.status(201).json({
      success: true,
      message: successMessages.register,
      data: newTourist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: errorMessages.serverError,
      error: error.message,
    });
  }
};
// delete
const deleteTourist = async (req, res) => {
  const { id } = req.params;
  try {
    await tourist.deleteTouristById(id);
    res.json({ message: "tourist deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting tourist", error: error.message });
  }
};

module.exports = {
  getAllTourists,
  getTourist,
  registerTourist,
  deleteTourist,
};
