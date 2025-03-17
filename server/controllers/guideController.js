const user = require("../models/userModel");

const getAllGuide = async (req, res) => {
  try {
    const guides = await user.getGuides();
    res.json(guides);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

const deleteGuide = async (req, res) => {
  const { id } = req.params;
  try {
    await user.deleteUserById(id);
    res.json({ message: "Guide deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting guide", error: error.message });
  }
};

module.exports = { getAllGuide, deleteGuide };
