const { countries } = require('countries-list');
const _ = require('lodash');

const validateTouristRegistration = (req, res, next) => {
  const touristData = req.body;
  const errors = [];

  // Required fields validation
  const requiredFields = [
    'firstName', 'lastName', 'email', 'contactNumber',
    'nicNumber', 'country', 'city', 'postalCode', 'addressLine1'
  ];
  
  requiredFields.forEach(field => {
    if (_.isEmpty(touristData[field])) {
      errors.push(`${field} is required`);
    }
  });

  // Email validation
  if (touristData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(touristData.email)) {
    errors.push('Invalid email format');
  }

  // Phone validation
  if (touristData.contactNumber && !/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(touristData.contactNumber)) {
    errors.push('Invalid phone number format');
  }

  // Address validation
  if (touristData.addressLine1 && touristData.addressLine1.length > 100) {
    errors.push('Address line 1 must be less than 100 characters');
  }

  if (touristData.addressLine2 && touristData.addressLine2.length > 100) {
    errors.push('Address line 2 must be less than 100 characters');
  }

  // Country validation
  if (touristData.country && !Object.values(countries).some(c => c.name === touristData.country)) {
    errors.push('Invalid country specified');
  }

  // NIC validation
  if (touristData.nicNumber && !/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(touristData.nicNumber)) {
    errors.push('Invalid NIC format. Use old (9 digits + V/X) or new (12 digits) format');
  }

  // Normalize address spaces if valid
  if (!errors.some(e => e.includes('Address line'))) {
    if (touristData.addressLine1) {
      req.body.addressLine1 = touristData.addressLine1.replace(/\s+/g, ' ').trim();
    }
    if (touristData.addressLine2) {
      req.body.addressLine2 = touristData.addressLine2.replace(/\s+/g, ' ').trim();
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = { validateTouristRegistration };