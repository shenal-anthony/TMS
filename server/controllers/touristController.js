const tourist = require("../models/touristModel");
const _ = require("lodash");
// tourist controller

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
      return res.status(404).json({ message: "Tourist not found" });
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

  try {
    // 1. Get ALL tourists with this NIC (returns array)
    const existingTourists = await tourist.findTouristByNIC(
      touristData.nicNumber
    );

    // An empty array has length = 0
    if (existingTourists && existingTourists.length > 0) {
      // 2. Check if any record has different names -> REJECT
      const hasDifferentPerson = existingTourists.some(
        (tourist) =>
          tourist.first_name.toLowerCase() !==
            touristData.firstName.toLowerCase() ||
          tourist.last_name.toLowerCase() !== touristData.lastName.toLowerCase()
      );

      if (hasDifferentPerson) {
        return res.status(400).json({
          success: false,
          message: "NIC number belongs to a different person",
        });
      }

      // 3. Check if ANY existing record has identical details
      const identicalTourist = existingTourists.find((tourist) =>
        _.isEqual(
          {
            email: tourist.email_address,
            contactNumber: tourist.contact_number,
            country: tourist.country,
            city: tourist.city,
            postalCode: tourist.postal_code,
            // addressLine1: tourist.addressline_01,
            // addressLine2: tourist.addressline_02,
          },
          {
            email: touristData.email,
            contactNumber: touristData.contactNumber,
            country: touristData.country,
            city: touristData.city,
            postalCode: touristData.postalCode,
            // addressLine1: touristData.addressLine1,
            // addressLine2: touristData.addressLine2,
          }
        )
      );
      console.log("🚀 ~ touristController.js:81 ~ registerTourist ~ identicalTourist:", identicalTourist);

      if (identicalTourist) {
        return res.status(200).json({
          success: true,
          message: "Tourist exists with identical details",
          data: identicalTourist,
        });
      }

      // 4. If same person but new details -> CREATE NEW ENTRY
      const newTourist = await tourist.addTourist(touristData);
      return res.status(201).json({
        success: true,
        message: "New tourist entry created for existing person",
        data: newTourist,
      });
    }

    // 5. If new tourist -> CREATE
    const newTourist = await tourist.addTourist(touristData);
    return res.status(201).json({
      success: true,
      message: "Tourist registered successfully",
      data: newTourist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
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
