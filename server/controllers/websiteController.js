const pkg = require("../models/packageModel");

// get package details
const getPackageDetails = async (req, res) => {
  const { packageId } = req.body;
  try {
    const content = await pkg.getPackageById(packageId);
    // Add your actual availability logic here
    const isAvailable = true; // Replace with real check

    res.json({
      available: isAvailable,
      packageId: content.package_id,
      packageName: content.package_name,
      price: content.price,
      duration: content.duration,
      accommodation: content.accommodation_id,
    });
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
