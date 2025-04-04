const pkg = require("../models/packageModel");

// get package details
const getPackageDetails = async (req, res) => {
  const { packageId } = req.body;
  try {
    const content = await pkg.getPackageById(packageId);
    console.log(
      "🚀 ~ websiteController.js:8 ~ getPackageDetails ~ content:",
      content
    );
    res.json(content);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching package details",
      error: error.message,
    });
  }
};

module.exports = {
  getPackageDetails,
};
