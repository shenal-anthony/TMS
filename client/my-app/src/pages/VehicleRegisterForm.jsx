
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import { DirectionsCar, Description } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const apiUrl = import.meta.env.VITE_API_URL;

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const compactStyles = {
  input: { py: 0.5, fontSize: "0.875rem" },
  button: { py: 0.5, fontSize: "0.875rem" },
  label: { fontSize: "0.875rem", mb: 0.5 },
};

const validateField = (name, value, formData) => {
  let error = "";

  switch (name) {
    case "email":
      if (!value.trim()) error = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        error = "Invalid email";
      break;
    case "brand":
    case "model":
      if (!value.trim()) error = "Required";
      else if (!/^[A-Za-z0-9\s-]+$/.test(value))
        error = "Letters, numbers, spaces, or hyphens only";
      break;
    case "vehicleColor":
      if (!value.trim()) error = "Required";
      else if (!/^[A-Za-z\s]+$/.test(value)) error = "Letters and spaces only";
      break;
    case "vehicleType":
      if (!value) error = "Required";
      break;
    case "seatCapacity":
      if (!value.trim()) error = "Required";
      else if (isNaN(value) || parseInt(value) < 1)
        error = "Must be at least 1";
      break;
    case "luggageCapacity":
      if (!value.trim()) error = "Required";
      else if (isNaN(value) || parseFloat(value) < 0)
        error = "Cannot be negative";
      break;
    case "fuelType":
      if (!value) error = "Required";
      break;
    case "registrationNumber":
    case "vehicleNumberPlate":
      if (!value.trim()) error = "Required";
      else if (!/^[A-Z0-9-]+$/.test(value.toUpperCase()))
        error = "Letters, numbers, or hyphens only";
      break;
    default:
      break;
  }
  return error;
};

const RegisterVehicleForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    brand: "",
    model: "",
    vehicleColor: "",
    vehicleType: "van",
    seatCapacity: "",
    luggageCapacity: "",
    fuelType: "petrol",
    airCondition: true,
    registrationNumber: "",
    vehicleNumberPlate: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    brand: "",
    model: "",
    vehicleColor: "",
    vehicleType: "",
    seatCapacity: "",
    luggageCapacity: "",
    fuelType: "",
    registrationNumber: "",
    vehicleNumberPlate: "",
  });
  const [vehiclePicture, setVehiclePicture] = useState(null);
  const [vehicleLicenses, setVehicleLicenses] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    const error = validateField(name, newValue, formData);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "registrationNumber" || name === "vehicleNumberPlate"
          ? value.toUpperCase()
          : newValue,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value, formData);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);

    if (type === "picture") {
      if (files[0] && !files[0].type.startsWith("image/")) {
        alert("Please upload an image file (JPEG, PNG, or WebP)");
        return;
      }
      setVehiclePicture(files[0]);
    } else if (type === "licenses") {
      if (files.length > 3) {
        alert("Maximum 3 license files allowed");
        return;
      }
      const invalidFiles = files.filter(
        (file) =>
          !file.type.startsWith("image/") && file.type !== "application/pdf"
      );
      if (invalidFiles.length > 0) {
        alert("Only images (JPEG, PNG, WebP) and PDFs allowed for licenses");
        return;
      }
      setVehicleLicenses(files);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key], formData);
      newErrors[key] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);

    if (!vehiclePicture) {
      alert("Vehicle picture is required");
      isValid = false;
    }
    if (vehicleLicenses.length === 0) {
      alert("At least one vehicle license is required");
      isValid = false;
    }
    if (!isConfirmed) {
      alert("Please confirm the information");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (vehiclePicture) data.append("vehiclePicture", vehiclePicture);
    vehicleLicenses.forEach((file) => data.append("vehicleLicense", file));

    try {
      const response = await axios.post(`${apiUrl}/api/vehicles/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Vehicle registration successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Vehicle registration failed:", err);
      alert(
        "Registration failed: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Vehicle Registration
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            size="small"
            fullWidth
            label="Owner's Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.email}
            helperText={errors.email}
            required
            sx={compactStyles.input}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              fullWidth
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.brand}
              helperText={errors.brand}
              required
              sx={compactStyles.input}
            />
            <TextField
              size="small"
              fullWidth
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.model}
              helperText={errors.model}
              required
              sx={compactStyles.input}
            />
          </Stack>
          <TextField
            size="small"
            fullWidth
            label="Vehicle Color"
            name="vehicleColor"
            value={formData.vehicleColor}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.vehicleColor}
            helperText={errors.vehicleColor}
            required
            sx={compactStyles.input}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Vehicle Type</InputLabel>
            <Select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              onBlur={handleBlur}
              label="Vehicle Type"
              error={!!errors.vehicleType}
              sx={compactStyles.input}
              MenuProps={{
                PaperProps: {
                  style: { maxHeight: 200, overflowY: "auto" },
                },
              }}
            >
              <MenuItem value="van">Van</MenuItem>
              <MenuItem value="car">Car</MenuItem>
              <MenuItem value="jeep">Jeep</MenuItem>
              <MenuItem value="suv">SUV</MenuItem>
              <MenuItem value="bus">Bus</MenuItem>
              <MenuItem value="truck">Truck</MenuItem>
            </Select>
            {errors.vehicleType && (
              <Typography variant="caption" color="error">
                {errors.vehicleType}
              </Typography>
            )}
          </FormControl>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Enter the number of passenger seats">
              <TextField
                size="small"
                fullWidth
                label="Seat Capacity"
                name="seatCapacity"
                type="number"
                value={formData.seatCapacity}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.seatCapacity}
                helperText={errors.seatCapacity}
                required
                sx={compactStyles.input}
                
              />
            </Tooltip>
            <Tooltip title="Enter luggage capacity in liters">
              <TextField
                size="small"
                fullWidth
                label="Luggage Capacity"
                name="luggageCapacity"
                type="number"
                value={formData.luggageCapacity}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.luggageCapacity}
                helperText={errors.luggageCapacity}
                required
                sx={compactStyles.input}
              />
            </Tooltip>
          </Stack>
          <FormControl size="small" fullWidth>
            <InputLabel>Fuel Type</InputLabel>
            <Select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              onBlur={handleBlur}
              label="Fuel Type"
              error={!!errors.fuelType}
              sx={compactStyles.input}
            >
              <MenuItem value="petrol">Petrol</MenuItem>
              <MenuItem value="diesel">Diesel</MenuItem>
              <MenuItem value="electric">Electric</MenuItem>
            </Select>
            {errors.fuelType && (
              <Typography variant="caption" color="error">
                {errors.fuelType}
              </Typography>
            )}
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={formData.airCondition}
                onChange={handleChange}
                name="airCondition"
              />
            }
            label={
              <Typography variant="body2">Air Condition Available</Typography>
            }
            sx={{ mt: 1 }}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              fullWidth
              label="Registration Number"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.registrationNumber}
              helperText={errors.registrationNumber}
              required
              sx={{
                ...compactStyles.input,
                "& .MuiInputBase-input": { textTransform: "uppercase" },
              }}
            />
            <TextField
              size="small"
              fullWidth
              label="Number Plate"
              name="vehicleNumberPlate"
              value={formData.vehicleNumberPlate}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.vehicleNumberPlate}
              helperText={errors.vehicleNumberPlate}
              required
              sx={{
                ...compactStyles.input,
                "& .MuiInputBase-input": { textTransform: "uppercase" },
              }}
            />
          </Stack>
          <Tooltip title="Upload one vehicle picture (JPEG, PNG, or WebP)">
            <Button
              component="label"
              variant="outlined"
              size="small"
              startIcon={<DirectionsCar fontSize="small" />}
              fullWidth
              sx={compactStyles.button}
            >
              Vehicle Picture
              <VisuallyHiddenInput
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileChange(e, "picture")}
              />
            </Button>
          </Tooltip>
          {vehiclePicture && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img
                src={URL.createObjectURL(vehiclePicture)}
                alt="Preview"
                style={{ width: 50, height: 50, objectFit: "cover" }}
              />
              <Typography variant="caption">{vehiclePicture.name}</Typography>
            </Box>
          )}
          <Tooltip title="Upload up to 3 vehicle license files (JPEG, PNG, WebP, or PDF)">
            <Button
              component="label"
              variant="outlined"
              size="small"
              startIcon={<Description fontSize="small" />}
              fullWidth
              sx={compactStyles.button}
            >
              Vehicle License(s) (max 3)
              <VisuallyHiddenInput
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => handleFileChange(e, "licenses")}
              />
            </Button>
          </Tooltip>
          {vehicleLicenses.length > 0 && (
            <Box>
              <Typography variant="caption">Selected files:</Typography>
              <Stack component="ul" sx={{ pl: 2, mt: 0 }}>
                {vehicleLicenses.map((file, idx) => (
                  <Typography key={idx} component="li" variant="caption">
                    {file.name}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={isConfirmed}
                onChange={() => setIsConfirmed(!isConfirmed)}
              />
            }
            label={
              <Typography variant="body2">
                I confirm the information is accurate
              </Typography>
            }
            sx={{ mt: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            size="small"
            fullWidth
            disabled={
              isSubmitting ||
              Object.values(errors).some((error) => error) ||
              !vehiclePicture ||
              vehicleLicenses.length === 0 ||
              !isConfirmed
            }
            sx={{ ...compactStyles.button, mt: 1 }}
          >
            {isSubmitting ? "Processing..." : "Register"}
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => navigate(-1)}
            sx={{ ...compactStyles.button, mt: 1 }}
          >
            Back
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default RegisterVehicleForm;
