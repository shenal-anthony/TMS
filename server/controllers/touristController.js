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
// do not use this
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

  // Ensure all string fields are trimmed and lowercased
  touristData.firstName = touristData.firstName?.trim().toLowerCase();
  touristData.lastName = touristData.lastName?.trim().toLowerCase();
  touristData.email = touristData.email?.trim().toLowerCase();
  touristData.contactNumber = touristData.contactNumber?.trim().toLowerCase();
  touristData.nicNumber = touristData.nicNumber?.trim().toLowerCase();
  touristData.country = touristData.country?.trim();
  touristData.city = touristData.city?.trim().toLowerCase();
  touristData.postalCode = touristData.postalCode?.trim().toLowerCase();
  touristData.addressLine01 = touristData.addressLine1?.trim().toLowerCase();
  touristData.addressLine02 = touristData.addressLine2?.trim().toLowerCase();

  if (touristData.addressLine2 === "") {
    touristData.addressLine2 = null; // Set to null if empty
  }

  try {
    // 1. Get ALL tourists with this NIC
    const existingTourists = await tourist.findTouristByNIC(
      touristData.nicNumber
    );

    if (existingTourists?.length > 0) {
      // 2. Name validation
      const hasDifferentPerson = existingTourists.some(
        (t) =>
          t.first_name.toLowerCase() !== touristData.firstName.toLowerCase() ||
          t.last_name.toLowerCase() !== touristData.lastName.toLowerCase()
      );

      if (hasDifferentPerson) {
        return res.status(400).json({
          success: false,
          message: "NIC number belongs to a different person",
        });
      }

      const identicalTourist = existingTourists.find((tourist) => {
        const dbRecord = {
          email: tourist.email_address,
          contactNumber: tourist.contact_number,
          country: tourist.country,
          city: tourist.city,
          postalCode: tourist.postal_code,
          addressLine01: tourist.addressline_01,
          addressLine02: tourist.addressline_02,
        };
        const inputData = {
          email: touristData.email,
          contactNumber: touristData.contactNumber,
          country: touristData.country,
          city: touristData.city,
          postalCode: touristData.postalCode,
          addressLine01: touristData.addressLine1,
          addressLine02: touristData.addressLine2,
        };

        const isMatch = _.isEqual(dbRecord, inputData);
        if (!isMatch) {
          // console.log("Mismatch found:", {
          //   differingFields: getDifferingFields(dbRecord, inputData),
          //   dbRecord,
          //   inputData,
          // });
        }
        return isMatch;
      });

      if (identicalTourist) {
        console.log("Found identical tourist record");
        return res.status(200).json({
          success: true,
          message: "Tourist exists with identical details",
          touristId: identicalTourist.tourist_id,
          email: identicalTourist.email_address,
          contactNumber: identicalTourist.contact_number,
        });
      }

      // 4. Create new entry if same person but different details
      const newTourist = await tourist.addTourist(touristData);
      return res.status(201).json({
        success: true,
        message: "New tourist entry created for existing person",
        touristId: newTourist.tourist_id,
        email: newTourist.email_address,
        contactNumber: newTourist.contact_number,
      });
    }

    // 5. Create new tourist if no existing records
    const newTourist = await tourist.addTourist(touristData);
    return res.status(201).json({
      success: true,
      message: "Tourist registered successfully",
      touristId: newTourist.tourist_id,
      email: newTourist.email_address,
      contactNumber: newTourist.contact_number,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Helper function to identify differing fields
function getDifferingFields(obj1, obj2) {
  return Object.keys(obj1).filter((key) => {
    return !_.isEqual(obj1[key], obj2[key]);
  });
}

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
