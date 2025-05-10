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
} from "@mui/material";
import { Person, Description } from "@mui/icons-material";
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

const validateNIC = (nic) => {
  if (!nic) return "NIC is required";

  const cleanedNIC = nic.trim().toUpperCase();
  const oldFormat = /^[0-9]{9}[VX]$/;
  const newFormat = /^[0-9]{12}$/;

  if (!oldFormat.test(cleanedNIC) && !newFormat.test(cleanedNIC)) {
    return "Invalid NIC format (Ex: 123456789V or 200012345678)";
  }

  if (cleanedNIC.length === 10) {
    const days = parseInt(cleanedNIC.substr(2, 3));
    if (days < 1 || days > 366) return "Invalid birth day in NIC (001-366)";
  }

  return "";
};

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    nic: "",
    address1: "",
    address2: "",
    password: "",
    confirmPassword: "",
    role: "Admin",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    nic: "",
    address1: "",
    password: "",
    confirmPassword: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) error = "Required";
        else if (!/^[A-Za-z]+$/.test(value)) error = "Letters only";
        break;
      case "contactNumber":
        if (!value.trim()) error = "Required";
        else if (!/^[0-9]{10}$/.test(value)) error = "10 digits required";
        break;
      case "email":
        if (!value.trim()) error = "Required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email";
        break;
      case "nic":
        error = validateNIC(value);
        break;
      case "address1":
        if (!value.trim()) error = "Required";
        break;
      case "password":
        if (!value.trim()) error = "Required";
        else if (value.length < 8) error = "Min 8 characters";
        break;
      case "confirmPassword":
        if (!value.trim()) error = "Required";
        else if (value !== formData.password) error = "Passwords don't match";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const error = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: name === "nic" ? value.toUpperCase() : value,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);

    if (type === "profile") {
      if (files[0] && !files[0].type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
      setProfileImage(files[0]);
    } else if (type === "licenses") {
      if (files.length > 3) {
        alert("Max 3 files allowed");
        return;
      }

      const invalidFiles = files.filter(
        (file) =>
          !file.type.startsWith("image/") && file.type !== "application/pdf"
      );

      if (invalidFiles.length > 0) {
        alert("Only images and PDFs allowed");
        return;
      }

      setLicenses(files);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    Object.keys(formData).forEach((key) => {
      if (key !== "address2" && key !== "role") {
        const error = validateField(key, formData[key]);
        newErrors[key] = error;
        if (error) isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isConfirmed) {
      alert("Please confirm the information");
      return false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (profileImage) data.append("profilePicture", profileImage);
    licenses.forEach((file) => data.append("touristLicense", file));

    try {
      await axios.post(`${apiUrl}/api/auth/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(
        "Registration failed: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h6" component="h2" gutterBottom>
        User Registration
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
              sx={compactStyles.input}
            />
            <TextField
              size="small"
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
              sx={compactStyles.input}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              fullWidth
              label="Contact"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.contactNumber}
              helperText={errors.contactNumber}
              required
              sx={compactStyles.input}
            />
            <TextField
              size="small"
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.email}
              helperText={errors.email}
              required
              sx={compactStyles.input}
            />
          </Stack>

          <TextField
            size="small"
            fullWidth
            label="NIC Number"
            name="nic"
            value={formData.nic}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.nic}
            helperText={errors.nic || "Format: 123456789V or 200012345678"}
            required
            slotProps={{
              input: {
                maxLength: 12,
                pattern: "([0-9]{9}[VX])|([0-9]{12})",
                style: { textTransform: "uppercase" },
              },
            }}
            sx={{
              "& .MuiInputBase-input": {
                textTransform: "uppercase",
              },
            }}
          />

          <TextField
            size="small"
            fullWidth
            label="Address Line 1"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.address1}
            helperText={errors.address1}
            required
            sx={compactStyles.input}
          />

          <TextField
            size="small"
            fullWidth
            label="Address Line 2"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            sx={compactStyles.input}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.password}
              helperText={errors.password}
              required
              sx={compactStyles.input}
            />
            <TextField
              size="small"
              fullWidth
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              required
              sx={compactStyles.input}
            />
          </Stack>

          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
              sx={compactStyles.input}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Guide">Guide</MenuItem>
            </Select>
          </FormControl>

          <Button
            component="label"
            variant="outlined"
            size="small"
            startIcon={<Person fontSize="small" />}
            fullWidth
            sx={compactStyles.button}
          >
            Profile Picture
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "profile")}
            />
          </Button>

          {profileImage && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img
                src={URL.createObjectURL(profileImage)}
                alt="Preview"
                style={{ width: 50, height: 50, objectFit: "cover" }}
              />
              <Typography variant="caption">{profileImage.name}</Typography>
            </Box>
          )}

          {formData.role === "guide" && (
            <>
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<Description fontSize="small" />}
                fullWidth
                sx={compactStyles.button}
              >
                Licenses (max 3)
                <VisuallyHiddenInput
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, "licenses")}
                />
              </Button>

              {licenses.length > 0 && (
                <Box>
                  <Typography variant="caption">Selected files:</Typography>
                  <Stack component="ul" sx={{ pl: 2, mt: 0 }}>
                    {licenses.map((file, idx) => (
                      <Typography key={idx} component="li" variant="caption">
                        {file.name}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}
            </>
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
            disabled={isSubmitting}
            sx={{ ...compactStyles.button, mt: 1 }}
          >
            {isSubmitting ? "Processing..." : "Register"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default RegistrationForm;
