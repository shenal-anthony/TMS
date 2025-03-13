import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const SignupForm = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    nic: "",
    address1: "",
    address2: "",
    profilePicture: null,
    role: "Guide",
    touristLicense: null,
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [modalOpen, setModalOpen] = useState(false); // For modal dialog visibility
  const [modalMessage, setModalMessage] = useState(""); // Message to display in the modal

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the user has agreed to the terms
    if (!formData.agreeTerms) {
      setModalMessage("You must agree to the Terms and Conditions before signing up.");
      setModalOpen(true); // Open modal dialog
      return; // Stop form submission
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setModalMessage("Passwords do not match.");
      setModalOpen(true); // Open modal dialog
      return;
    }

    // Check if all required fields are filled
    const requiredFields = [
      "firstName",
      "lastName",
      "contactNumber",
      "email",
      "nic",
      "address1",
      "password",
      "confirmPassword",
    ];
    const isFormValid = requiredFields.every((field) => formData[field]);
    if (!isFormValid) {
      setModalMessage("Please fill out all required fields.");
      setModalOpen(true); // Open modal dialog
      return;
    }

    const formPayload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        formPayload.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/register`,
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      navigate("/login");
    } catch (error) {
      console.error("Error registering user:", error);
      if (error.response?.data?.message === "User already exists") {
        setModalMessage("User with this email already exists.");
      } else {
        setModalMessage(
          error.response?.data?.message || "An error occurred during registration."
        );
      }
      setModalOpen(true); // Open modal dialog
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close modal dialog
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2, // Adds spacing between child elements
        }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          Create your account
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="First name"
              name="firstName"
              fullWidth
              onChange={handleChange}
              value={formData.firstName}
              required
            />
            <TextField
              label="Last name"
              name="lastName"
              fullWidth
              onChange={handleChange}
              value={formData.lastName}
              required
            />
            <TextField
              label="Contact number"
              name="contactNumber"
              fullWidth
              onChange={handleChange}
              value={formData.contactNumber}
              required
            />
            <TextField
              label="E-mail"
              name="email"
              type="email"
              fullWidth
              onChange={handleChange}
              value={formData.email}
              required
            />
            <TextField
              label="NIC"
              name="nic"
              fullWidth
              onChange={handleChange}
              value={formData.nic}
              required
            />
            <TextField
              label="Address Line 01"
              name="address1"
              fullWidth
              onChange={handleChange}
              value={formData.address1}
              required
            />
            <TextField
              label="Address Line 02"
              name="address2"
              fullWidth
              onChange={handleChange}
              value={formData.address2}
            />

            <Box>
              <Button variant="contained" component="label">
                Upload Profile Picture
                <input
                  type="file"
                  name="profilePicture"
                  onChange={handleChange}
                  hidden
                />
              </Button>
              {formData.profilePicture && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {formData.profilePicture.name}
                </Typography>
              )}
            </Box>

            <TextField
              select
              label="Select the role"
              name="role"
              fullWidth
              onChange={handleChange}
              value={formData.role}
            >
              <MenuItem value="Guide">Guide</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>

            {formData.role === "Guide" && (
              <Box>
                <Button variant="contained" component="label">
                  Upload Tourist License
                  <input
                    type="file"
                    name="touristLicense"
                    onChange={handleChange}
                    hidden
                  />
                </Button>
                {formData.touristLicense && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected file: {formData.touristLicense.name}
                  </Typography>
                )}
              </Box>
            )}

            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              onChange={handleChange}
              value={formData.password}
              required
            />
            <TextField
              label="Re-enter Password"
              name="confirmPassword"
              type="password"
              fullWidth
              onChange={handleChange}
              value={formData.confirmPassword}
              required
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="agreeTerms"
                  onChange={handleChange}
                  checked={formData.agreeTerms}
                />
              }
              label="I agree to the Terms and Conditions, and Privacy Policy"
            />

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Sign Up
            </Button>

            <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
              Already have an account?{" "}
              <a href="/login" style={{ color: "primary.main" }}>
                Sign In
              </a>
            </Typography>
          </Box>
        </form>

        {/* Modal Dialog for all error messages */}
        <Dialog open={modalOpen} onClose={handleCloseModal}>
          <DialogTitle>Error</DialogTitle>
          <DialogContent>
            <Typography>{modalMessage}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default SignupForm;